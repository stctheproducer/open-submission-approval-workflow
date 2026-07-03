import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiQuery } from "@/lib/query"
import { canApprove, canStartReview, type ReviewState, type WorkflowApplication } from "@/lib/review-workflow"

type ProblemDetails = {
  detail?: string
  errors?: Array<{
    field?: string
    message: string
  }>
}

type QueueResponse = {
  data: WorkflowApplication[]
  metadata: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
  }
}

type UseReviewerWorkspaceOptions = {
  applicationId?: number
  includeQueue?: boolean
  includeApplication?: boolean
  navigateToDetailOnStartReview?: boolean
}

function parseProblemDetails(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "json" in error.response &&
    typeof error.response.json === "function"
  ) {
    return error.response.json() as Promise<ProblemDetails>
  }

  return Promise.resolve({ detail: undefined })
}

export function useReviewerWorkspace({
  applicationId,
  includeQueue = true,
  includeApplication = true,
  navigateToDetailOnStartReview = false,
}: UseReviewerWorkspaceOptions = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const reviewState = searchParams.get("reviewState")
  const activeReviewState: ReviewState | null =
    reviewState === "ready" || reviewState === "owned" ? reviewState : null
  const [actionError, setActionError] = useState<string | null>(null)

  const queueQuery = useQuery({
    ...(activeReviewState
      ? apiQuery.reviewer.applications.index.queryOptions({
          query: { reviewState: activeReviewState },
        })
      : apiQuery.reviewer.applications.index.queryOptions()),
    enabled: includeQueue,
  })

  const applicationQuery = useQuery({
    ...apiQuery.reviewer.applications.show.queryOptions({
      params: { id: applicationId ?? 0 },
    }),
    enabled: includeApplication && typeof applicationId === "number" && Number.isFinite(applicationId),
  })

  const startReviewMutation = useMutation({
    ...apiQuery.reviewer.applicationReviewStarts.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      setActionError(details.detail ?? "We couldn’t start review right now.")
    },
    onSuccess: (response, variables) => {
      setActionError(null)
      queryClient.setQueryData(
        apiQuery.reviewer.applications.show.queryKey({ params: { id: variables.params.id } }),
        response,
      )
      queryClient.invalidateQueries(apiQuery.reviewer.applications.pathFilter())
      if (navigateToDetailOnStartReview) {
        navigate(`/reviewer/applications/${variables.params.id}`, { replace: true })
      }
    },
  })

  const approvalMutation = useMutation({
    ...apiQuery.reviewer.applicationApprovals.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      setActionError(details.detail ?? "We couldn’t approve this application.")
    },
    onSuccess: (response, variables) => {
      setActionError(null)
      queryClient.setQueryData(
        apiQuery.reviewer.applications.show.queryKey({ params: { id: variables.params.applicationId } }),
        response,
      )
      queryClient.invalidateQueries(apiQuery.reviewer.applications.pathFilter())
    },
  })

  const application = applicationQuery.data?.data as WorkflowApplication | undefined
  const reviewQueue = queueQuery.data as QueueResponse | undefined
  const currentApplicationId = application?.id ?? applicationId

  function setReviewFilter(nextFilter: ReviewState | null) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextFilter) {
      nextParams.set("reviewState", nextFilter)
    } else {
      nextParams.delete("reviewState")
    }

    setSearchParams(nextParams, { replace: true })
  }

  function startReview(applicationIdToStart: number) {
    setActionError(null)
    startReviewMutation.mutate({ params: { id: applicationIdToStart } })
  }

  function startCurrentApplicationReview() {
    if (!currentApplicationId) {
      return
    }

    startReview(currentApplicationId)
  }

  function approveCurrentApplication() {
    if (!currentApplicationId) {
      return
    }

    setActionError(null)
    approvalMutation.mutate({ params: { applicationId: currentApplicationId } })
  }

  return {
    activeReviewState,
    actionError,
    application,
    applicationQuery,
    approveCurrentApplication,
    canApprove: canApprove(application),
    canStartReview: canStartReview(application),
    currentApplicationId,
    isApprovalPending:
      approvalMutation.isPending &&
      approvalMutation.variables?.params.applicationId === currentApplicationId,
    isStartReviewPending:
      startReviewMutation.isPending &&
      startReviewMutation.variables?.params.id === currentApplicationId,
    isStartingReview: (applicationIdToCheck: number) =>
      startReviewMutation.isPending &&
      startReviewMutation.variables?.params.id === applicationIdToCheck,
    queueQuery,
    reviewQueue,
    setReviewFilter,
    startCurrentApplicationReview,
    startReview,
  }
}

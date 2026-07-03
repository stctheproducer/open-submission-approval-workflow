import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiQuery } from "@/lib/query"
import {
  canApprove,
  canStartReview,
  type ReviewState,
  type WorkflowApplication,
} from "@/lib/review-workflow"

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

const REVIEW_QUEUE_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const

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
  const pageParam = Number(searchParams.get("page") ?? "1")
  const activePage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const perPageParam = Number(searchParams.get("perPage") ?? "20")
  const activePerPage = REVIEW_QUEUE_PAGE_SIZE_OPTIONS.includes(
    Number.isFinite(perPageParam) && perPageParam > 0
      ? (Math.floor(
          perPageParam
        ) as (typeof REVIEW_QUEUE_PAGE_SIZE_OPTIONS)[number])
      : 20
  )
    ? Number.isFinite(perPageParam) && perPageParam > 0
      ? Math.floor(perPageParam)
      : 20
    : 20
  const [actionError, setActionError] = useState<string | null>(null)

  const queueQuery = useQuery({
    ...(activeReviewState
      ? apiQuery.reviewer.applications.index.queryOptions({
          query: {
            reviewState: activeReviewState,
            page: activePage,
            perPage: activePerPage,
          },
        })
      : apiQuery.reviewer.applications.index.queryOptions({
          query: { page: activePage, perPage: activePerPage },
        })),
    enabled: includeQueue,
  })

  const applicationQuery = useQuery({
    ...apiQuery.reviewer.applications.show.queryOptions({
      params: { id: applicationId ?? 0 },
    }),
    enabled:
      includeApplication &&
      typeof applicationId === "number" &&
      Number.isFinite(applicationId),
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
        apiQuery.reviewer.applications.show.queryKey({
          params: { id: variables.params.id },
        }),
        response
      )
      queryClient.invalidateQueries(apiQuery.reviewer.applications.pathFilter())
      if (navigateToDetailOnStartReview) {
        navigate(`/reviewer/applications/${variables.params.id}`, {
          replace: true,
        })
      }
    },
  })

  const approvalMutation = useMutation({
    ...apiQuery.reviewer.applicationApprovals.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      setActionError(details.detail ?? "We couldn’t approve this application.")
    },
    onSuccess: async (response, variables) => {
      setActionError(null)
      queryClient.setQueryData(
        apiQuery.reviewer.applications.show.queryKey({
          params: { id: variables.params.applicationId },
        }),
        response
      )
      queryClient.invalidateQueries(apiQuery.reviewer.applications.pathFilter())
      navigate("/reviewer", { replace: true })
    },
  })

  const changeRequestMutation = useMutation({
    ...apiQuery.reviewer.applicationChangeRequests.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      setActionError(details.detail ?? "We couldn’t request changes right now.")
    },
    onSuccess: async () => {
      setActionError(null)
      navigate("/reviewer", { replace: true })
      await queryClient.invalidateQueries(
        apiQuery.reviewer.applications.pathFilter()
      )
    },
  })

  const rejectionMutation = useMutation({
    ...apiQuery.reviewer.applicationRejections.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      setActionError(details.detail ?? "We couldn’t reject this application.")
    },
    onSuccess: async () => {
      setActionError(null)
      navigate("/reviewer", { replace: true })
      await queryClient.invalidateQueries(
        apiQuery.reviewer.applications.pathFilter()
      )
    },
  })

  const application = applicationQuery.data?.data as
    WorkflowApplication | undefined
  const reviewQueue = queueQuery.data as QueueResponse | undefined
  const currentApplicationId = application?.id ?? applicationId

  function setReviewFilter(nextFilter: ReviewState | null) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextFilter) {
      nextParams.set("reviewState", nextFilter)
    } else {
      nextParams.delete("reviewState")
    }
    nextParams.delete("page")

    setSearchParams(nextParams, { replace: true, preventScrollReset: true })
  }

  function setQueuePage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      nextParams.delete("page")
    } else {
      nextParams.set("page", String(nextPage))
    }

    setSearchParams(nextParams, { replace: true, preventScrollReset: true })
  }

  function setQueuePerPage(nextPerPage: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("perPage", String(nextPerPage))
    nextParams.delete("page")
    setSearchParams(nextParams, { replace: true, preventScrollReset: true })
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

  async function requestChangesCurrentApplication(comment: string) {
    if (!currentApplicationId) {
      return
    }

    setActionError(null)
    await changeRequestMutation.mutateAsync({
      params: { id: currentApplicationId },
      body: { comment },
    })
  }

  async function rejectCurrentApplication(comment: string) {
    if (!currentApplicationId) {
      return
    }

    setActionError(null)
    await rejectionMutation.mutateAsync({
      params: { application_id: currentApplicationId },
      body: { comment },
    })
  }

  return {
    activeReviewState,
    actionError,
    application,
    applicationQuery,
    approveCurrentApplication,
    canApprove: canApprove(application),
    canReject: canApprove(application),
    canRequestChanges: canApprove(application),
    canStartReview: canStartReview(application),
    currentApplicationId,
    isApprovalPending:
      approvalMutation.isPending &&
      approvalMutation.variables?.params.applicationId === currentApplicationId,
    isChangeRequestPending:
      changeRequestMutation.isPending &&
      changeRequestMutation.variables?.params.id === currentApplicationId,
    isRejectionPending:
      rejectionMutation.isPending &&
      rejectionMutation.variables?.params.application_id ===
        currentApplicationId,
    isStartReviewPending:
      startReviewMutation.isPending &&
      startReviewMutation.variables?.params.id === currentApplicationId,
    isStartingReview: (applicationIdToCheck: number) =>
      startReviewMutation.isPending &&
      startReviewMutation.variables?.params.id === applicationIdToCheck,
    queueQuery,
    refetchQueue: queueQuery.refetch,
    rejectCurrentApplication,
    reviewQueue,
    requestChangesCurrentApplication,
    setQueuePage,
    setQueuePerPage,
    setReviewFilter,
    startCurrentApplicationReview,
    startReview,
  }
}

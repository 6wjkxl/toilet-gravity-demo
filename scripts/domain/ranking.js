const DAY_IN_MILLISECONDS = 86_400_000

const clamp = (value, minimum, maximum) => (
  Math.min(maximum, Math.max(minimum, value))
)

export function allReviewsFor(toilets, localReviews) {
  const seedReviews = toilets.flatMap((toilet) => (
    toilet.seedReviews.map((review) => ({
      ...review,
      toiletId: toilet.id
    }))
  ))

  return seedReviews.concat(localReviews)
}

export function bayesianRating(
  reviews,
  globalAverage = 3.8,
  priorWeight = 5
) {
  if (!reviews.length) {
    return globalAverage
  }

  const average = reviews.reduce(
    (sum, item) => sum + item.overallRating,
    0
  ) / reviews.length

  return (
    reviews.length * average + priorWeight * globalAverage
  ) / (reviews.length + priorWeight)
}

function completeness(toilet) {
  const values = [
    toilet.entranceDescription,
    toilet.openingHours,
    toilet.facilities?.length,
    toilet.dataSource
  ]

  return values.filter(Boolean).length / values.length
}

export function rankToilets(toilets, reviews, now = new Date()) {
  return toilets
    .filter(({ status }) => status !== 'closed')
    .map((toilet) => {
      const ownReviews = reviews.filter(
        ({ toiletId }) => toiletId === toilet.id
      )
      const rating = bayesianRating(ownReviews) / 5
      const confidence = clamp(ownReviews.length / 20, 0, 1)
      const daysSinceVerification = Math.max(
        0,
        (now - new Date(toilet.lastVerifiedAt)) / DAY_IN_MILLISECONDS
      )
      const freshness = clamp(1 - daysSinceVerification / 90, 0, 1)
      const complete = completeness(toilet)
      const rankingScore = Math.round((
        rating * 0.65
        + confidence * 0.15
        + freshness * 0.12
        + complete * 0.08
      ) * 1000) / 10

      let rankReason = '资料完整 · 等待更多评价'
      if (ownReviews.length >= 5) {
        rankReason = '评价更充分 · 近期已确认'
      } else if (freshness > 0.7) {
        rankReason = '近期已确认 · 资料完整'
      }

      return {
        ...toilet,
        rankingScore,
        rankReason
      }
    })
    .sort((first, second) => (
      second.rankingScore - first.rankingScore
      || first.id.localeCompare(second.id, 'zh-CN')
    ))
}

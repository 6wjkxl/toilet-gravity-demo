const DEFAULT_KEY = 'toilet-gravity:reviews:v1'
const RATING_FIELDS = [
  'overallRating',
  'cleanlinessRating',
  'findabilityRating',
  'facilityRating'
]

function validateReview(review) {
  for (const field of RATING_FIELDS) {
    if (
      !Number.isInteger(review[field])
      || review[field] < 1
      || review[field] > 5
    ) {
      throw new Error('评分必须在 1 到 5 之间')
    }
  }

  if (!review.id || !review.toiletId) {
    throw new Error('评价缺少地点或编号')
  }

  if (String(review.content).trim().length > 300) {
    throw new Error('评价最多 300 个字')
  }
}

export function createReviewStore(storage, key = DEFAULT_KEY) {
  const read = () => {
    try {
      const value = JSON.parse(storage.getItem(key) ?? '[]')
      return Array.isArray(value) ? value : []
    } catch {
      return []
    }
  }

  const write = (reviews) => {
    storage.setItem(key, JSON.stringify(reviews))
  }

  return {
    list() {
      return read()
    },

    upsert(review) {
      validateReview(review)
      const reviews = read()
      const index = reviews.findIndex(({ id }) => id === review.id)

      if (index === -1) {
        reviews.push(review)
      } else {
        reviews[index] = review
      }

      write(reviews)
      return review
    },

    remove(id) {
      write(read().filter((review) => review.id !== id))
    },

    clear() {
      storage.removeItem(key)
    }
  }
}

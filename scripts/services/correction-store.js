const DEFAULT_KEY = 'toilet-gravity:corrections:v1'
const CATEGORIES = new Set([
  'availability',
  'opening-hours',
  'entrance',
  'fee',
  'facilities',
  'other'
])
const STATUSES = new Set(['pending', 'accepted', 'ignored'])
const AVAILABILITY_STATES = new Set(['open', 'temporarily-unavailable', 'removed', 'uncertain'])
const FEE_TYPES = new Set(['free', 'paid', 'uncertain'])
const FACILITY_KEYS = new Set(['handWash', 'toiletPaper', 'seated', 'accessible', 'family'])
const FACILITY_STATES = new Set(['present', 'absent', 'uncertain'])

const hasText = (value) => typeof value === 'string' && value.trim().length > 0
const textWithin = (value, maximum) => typeof value === 'string' && value.trim().length <= maximum

function validateProposedValue(category, proposedValue) {
  if (!proposedValue || typeof proposedValue !== 'object' || Array.isArray(proposedValue)) {
    return '请填写建议修改的内容'
  }

  if (category === 'availability' && !AVAILABILITY_STATES.has(proposedValue.state)) {
    return '请选择厕所当前状态'
  }

  if (category === 'opening-hours' && (!hasText(proposedValue.openingHours) || proposedValue.openingHours.trim().length > 120)) {
    return '请填写新的开放时间'
  }

  if (category === 'entrance' && (!hasText(proposedValue.entranceDescription) || proposedValue.entranceDescription.trim().length > 200)) {
    return '请填写正确的入口说明'
  }

  if (category === 'fee') {
    if (!FEE_TYPES.has(proposedValue.feeType)) return '请选择收费情况'
    if (proposedValue.amount !== undefined && !textWithin(proposedValue.amount, 50)) return '收费说明最多50个字'
  }

  if (category === 'facilities') {
    const facilities = proposedValue.facilities
    const entries = facilities && typeof facilities === 'object' && !Array.isArray(facilities)
      ? Object.entries(facilities)
      : []
    if (
      entries.length === 0
      || entries.some(([key, value]) => !FACILITY_KEYS.has(key) || !FACILITY_STATES.has(value))
    ) {
      return '请至少选择一项设施变化'
    }
  }

  if (category === 'other' && (!hasText(proposedValue.description) || proposedValue.description.trim().length > 300)) {
    return '请用300个字以内说明问题'
  }

  return ''
}

export function validateCorrection(correction, { toiletIds = [] } = {}) {
  if (!hasText(correction?.id) || !hasText(correction?.toiletId)) {
    return { valid: false, message: '纠错记录缺少编号或地点' }
  }

  if (toiletIds.length > 0 && !toiletIds.includes(correction.toiletId)) {
    return { valid: false, message: '地点不在演示数据中' }
  }

  if (!CATEGORIES.has(correction.category)) {
    return { valid: false, message: '问题类型无效' }
  }

  if (!STATUSES.has(correction.status)) {
    return { valid: false, message: '审核状态无效' }
  }

  if (!textWithin(correction.note ?? '', 300)) {
    return { valid: false, message: '补充说明最多300个字' }
  }

  if (!hasText(correction.createdAt) || !hasText(correction.updatedAt)) {
    return { valid: false, message: '纠错记录缺少时间' }
  }

  const proposedValueError = validateProposedValue(correction.category, correction.proposedValue)
  if (proposedValueError) return { valid: false, message: proposedValueError }

  return { valid: true, message: '' }
}

export function createCorrectionStore(storage, {
  key = DEFAULT_KEY,
  toiletIds = []
} = {}) {
  const read = () => {
    try {
      const value = JSON.parse(storage.getItem(key) ?? '[]')
      return { records: Array.isArray(value) ? value : [], error: null }
    } catch {
      return { records: [], error: '本地纠错记录无法读取' }
    }
  }

  const mutableRecords = () => {
    const result = read()
    if (result.error) throw new Error(result.error)
    return result.records
  }

  const write = (corrections) => {
    try {
      storage.setItem(key, JSON.stringify(corrections))
    } catch {
      throw new Error('纠错内容没有保存，请检查浏览器是否允许本地存储')
    }
  }

  return {
    list() {
      const result = read()
      if (result.error) {
        return { valid: [], invalid: [{ id: 'storage', message: result.error }] }
      }

      return result.records.reduce((prepared, correction, index) => {
        const validation = validateCorrection(correction, { toiletIds })

        if (validation.valid) {
          prepared.valid.push(correction)
        } else {
          prepared.invalid.push({
            id: correction?.id || `unknown-${index + 1}`,
            message: validation.message
          })
        }

        return prepared
      }, { valid: [], invalid: [] })
    },

    upsert(correction) {
      const validation = validateCorrection(correction, { toiletIds })
      if (!validation.valid) throw new Error(validation.message)

      const corrections = mutableRecords()
      const index = corrections.findIndex(({ id }) => id === correction.id)

      if (index === -1) {
        if (correction.status !== 'pending') throw new Error('新提交必须处于待审核状态')
        corrections.push(correction)
      } else {
        if (corrections[index].status !== 'pending') throw new Error('已审核的内容不能修改')
        corrections[index] = correction
      }

      write(corrections)
      return correction
    },

    remove(id) {
      const corrections = mutableRecords()
      const selected = corrections.find((correction) => correction.id === id)
      if (!selected || selected.status !== 'pending') throw new Error('只有待审核内容可以撤回')
      write(corrections.filter((correction) => correction.id !== id))
    },

    setStatus(id, status, { now = new Date() } = {}) {
      if (!STATUSES.has(status)) throw new Error('审核状态无效')

      const corrections = mutableRecords()
      const index = corrections.findIndex((correction) => correction.id === id)
      if (index === -1) throw new Error('没有找到这条纠错内容')

      corrections[index] = {
        ...corrections[index],
        status,
        updatedAt: now.toISOString()
      }
      write(corrections)
      return corrections[index]
    }
  }
}

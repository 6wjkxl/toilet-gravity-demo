const CATEGORY_LABELS = Object.freeze({
  availability: '厕所状态有变化',
  'opening-hours': '开放时间有变化',
  entrance: '入口说明不准确',
  fee: '收费情况有变化',
  facilities: '设施信息有变化',
  other: '其他问题'
})

const STATUS_LABELS = Object.freeze({
  pending: '待审核',
  accepted: '已采用',
  ignored: '已忽略'
})

const AVAILABILITY_LABELS = Object.freeze({
  open: '可以正常使用',
  'temporarily-unavailable': '暂时无法使用',
  removed: '已关闭或拆除',
  uncertain: '不确定'
})

const FEE_LABELS = Object.freeze({
  free: '免费',
  paid: '需要收费',
  uncertain: '不确定'
})

const FACILITY_FIELDS = Object.freeze([
  ['facilityHandWash', 'handWash', '洗手池'],
  ['facilityToiletPaper', 'toiletPaper', '厕纸'],
  ['facilitySeated', 'seated', '坐便位'],
  ['facilityAccessible', 'accessible', '无障碍设施'],
  ['facilityFamily', 'family', '亲子设施']
])

const FACILITY_STATE_LABELS = Object.freeze({
  present: '有',
  absent: '没有',
  uncertain: '不确定'
})

const clean = (value) => String(value ?? '').trim()

function proposedValueFrom(values) {
  if (values.category === 'availability') {
    return { state: clean(values.availabilityState) }
  }

  if (values.category === 'opening-hours') {
    return { openingHours: clean(values.openingHours) }
  }

  if (values.category === 'entrance') {
    return { entranceDescription: clean(values.entranceDescription) }
  }

  if (values.category === 'fee') {
    const value = { feeType: clean(values.feeType) }
    const amount = clean(values.feeAmount)
    if (amount) value.amount = amount
    return value
  }

  if (values.category === 'facilities') {
    const facilities = {}
    FACILITY_FIELDS.forEach(([formName, key]) => {
      const value = clean(values[formName])
      if (value) facilities[key] = value
    })
    return { facilities }
  }

  return { description: clean(values.otherDescription) }
}

export function correctionFromValues(values, toiletId, {
  existing = null,
  now = new Date(),
  idFactory = () => crypto.randomUUID()
} = {}) {
  const timestamp = now.toISOString()

  return {
    id: existing?.id ?? `correction-${idFactory()}`,
    toiletId,
    category: clean(values.category),
    proposedValue: proposedValueFrom(values),
    note: clean(values.note),
    status: 'pending',
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp
  }
}

export function filterCorrections(corrections, status = 'all') {
  if (status === 'all') return [...corrections]
  return corrections.filter((correction) => correction.status === status)
}

export function correctionsForToilet(corrections, toiletId) {
  return corrections.filter((correction) => correction.toiletId === toiletId)
}

export function valuesFromCorrection(correction) {
  const values = {
    category: correction.category,
    note: correction.note
  }
  const proposed = correction.proposedValue

  if (correction.category === 'availability') values.availabilityState = proposed.state
  if (correction.category === 'opening-hours') values.openingHours = proposed.openingHours
  if (correction.category === 'entrance') values.entranceDescription = proposed.entranceDescription
  if (correction.category === 'fee') {
    values.feeType = proposed.feeType
    if (proposed.amount) values.feeAmount = proposed.amount
  }
  if (correction.category === 'facilities') {
    FACILITY_FIELDS.forEach(([formName, key]) => {
      if (proposed.facilities[key]) values[formName] = proposed.facilities[key]
    })
  }
  if (correction.category === 'other') values.otherDescription = proposed.description

  return values
}

function correctionDetail(correction) {
  const value = correction.proposedValue

  if (correction.category === 'availability') return AVAILABILITY_LABELS[value.state] ?? '不确定'
  if (correction.category === 'opening-hours') return value.openingHours
  if (correction.category === 'entrance') return value.entranceDescription
  if (correction.category === 'fee') {
    const label = FEE_LABELS[value.feeType] ?? '不确定'
    return value.amount ? `${label}：${value.amount}` : label
  }
  if (correction.category === 'facilities') {
    return FACILITY_FIELDS
      .filter(([, key]) => value.facilities[key])
      .map(([, key, label]) => `${label}：${FACILITY_STATE_LABELS[value.facilities[key]]}`)
      .join('；')
  }
  return value.description
}

export function correctionViewModel(correction) {
  return {
    id: correction.id,
    toiletId: correction.toiletId,
    categoryLabel: CATEGORY_LABELS[correction.category] ?? '其他问题',
    detail: correctionDetail(correction),
    note: correction.note || '没有补充说明',
    status: correction.status,
    statusLabel: STATUS_LABELS[correction.status] ?? '状态未知',
    updatedAt: correction.updatedAt
  }
}

export { CATEGORY_LABELS, STATUS_LABELS }

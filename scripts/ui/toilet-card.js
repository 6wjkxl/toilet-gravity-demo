import { element } from './dom.js'

const STATUS = {
  open: '开放中',
  uncertain: '待确认',
  closed: '暂时关闭'
}

const FACILITIES = {
  accessible: '无障碍',
  family: '亲子设施',
  seated: '坐便位',
  'toilet-paper': '提供厕纸',
  'hand-wash': '可洗手'
}

function formatDistance(distance) {
  if (!Number.isFinite(distance)) return '演示距离待计算'
  if (distance === 0) return '演示起点'
  if (distance < 1000) return `${distance} 米`
  return `${(distance / 1000).toFixed(1)} 公里`
}

export function toToiletCardViewModel(toilet) {
  return {
    ...toilet,
    statusText: STATUS[toilet.status] ?? '状态未知',
    distanceText: formatDistance(toilet.distanceMeters),
    detailUrl: `detail.html?id=${encodeURIComponent(toilet.id)}`,
    facilityText: toilet.facilities.map((value) => FACILITIES[value] ?? value).join(' · '),
    feeText: toilet.feeType === 'free' ? '免费' : '收费情况待确认'
  }
}

export function createToiletCard(toilet) {
  const viewModel = toToiletCardViewModel(toilet)
  const article = element('article', { className: 'toilet-card' })
  const status = element('p', {
    className: `status status--${viewModel.status}`,
    text: `${viewModel.statusText} · ${viewModel.distanceText}`
  })
  const title = element('h3', { text: viewModel.name })
  const entrance = element('p', {
    className: 'toilet-entrance',
    text: `入口：${viewModel.entranceDescription}`
  })
  const meta = element('p', {
    className: 'toilet-meta',
    text: [viewModel.feeText, viewModel.facilityText].filter(Boolean).join(' · ')
  })
  const link = element('a', {
    className: 'button button--primary',
    text: '查看详情',
    attrs: { href: viewModel.detailUrl }
  })

  article.append(status, title, entrance, meta, link)
  return article
}

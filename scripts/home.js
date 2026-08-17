import { TOILETS } from './data/toilets.js'
import { filterToilets } from './domain/catalog.js'
import { normalizeMapPoint, sortByDistance } from './domain/distance.js'
import { allReviewsFor, rankToilets } from './domain/ranking.js'
import { requestLocation } from './services/location.js'
import { createReviewStore } from './services/review-store.js'
import { element } from './ui/dom.js'
import { createToiletCard } from './ui/toilet-card.js'

const DEFAULT_ORIGIN = { latitude: 30.3158, longitude: 112.2471 }
const DEMO_BOUNDS = {
  minLat: 30.3,
  maxLat: 30.33,
  minLng: 112.23,
  maxLng: 112.27
}

const state = {
  origin: DEFAULT_ORIGIN,
  query: '',
  status: 'all',
  facilities: []
}

const filters = document.querySelector('#filters')
const list = document.querySelector('#toilet-list')
const emptyState = document.querySelector('#empty-state')
const resultSummary = document.querySelector('#result-summary')
const locateButton = document.querySelector('#locate-button')
const locationStatus = document.querySelector('#location-status')
const demoMap = document.querySelector('#demo-map')
const rankingList = document.querySelector('#ranking-list')
const reviewStore = createReviewStore(window.localStorage)

function renderDemoMap(toilets) {
  const note = element('p', {
    className: 'map-note',
    text: '示意图 · 不是真实地图'
  })
  const markers = toilets.map((toilet, index) => {
    const point = normalizeMapPoint(toilet, DEMO_BOUNDS)
    const marker = element('button', {
      className: `map-marker map-marker--${toilet.status}`,
      attrs: {
        type: 'button',
        title: toilet.name,
        'aria-label': `查看${toilet.name}详情`
      }
    })

    marker.append(element('span', { text: String(index + 1) }))
    marker.style.left = `${point.x * 100}%`
    marker.style.top = `${point.y * 100}%`
    marker.addEventListener('click', () => {
      window.location.href = `detail.html?id=${encodeURIComponent(toilet.id)}`
    })

    return marker
  })

  demoMap.replaceChildren(...markers, note)
}

function render() {
  const nearby = sortByDistance(TOILETS, state.origin)
  const filtered = filterToilets(nearby, state)

  list.replaceChildren(...filtered.map(createToiletCard))
  renderDemoMap(filtered)
  emptyState.hidden = filtered.length !== 0
  resultSummary.textContent = `找到 ${filtered.length} 个演示地点`
}

function renderRanking() {
  const ranked = rankToilets(
    TOILETS,
    allReviewsFor(TOILETS, reviewStore.list()),
    new Date()
  ).slice(0, 3)

  rankingList.replaceChildren(...ranked.map((toilet) => {
    const item = element('li', { className: 'rank-item' })
    const heading = element('div', { className: 'rank-item-heading' })
    heading.append(
      element('a', {
        text: toilet.name,
        attrs: { href: `detail.html?id=${encodeURIComponent(toilet.id)}` }
      }),
      element('strong', { text: `${toilet.rankingScore} 分` })
    )
    item.append(
      heading,
      element('p', { text: toilet.rankReason })
    )
    return item
  }))
}

filters.addEventListener('input', (event) => {
  if (event.target.id === 'search-input') state.query = event.target.value
  if (event.target.id === 'status-filter') state.status = event.target.value

  if (event.target.name === 'facility') {
    state.facilities = [...filters.querySelectorAll('input[name="facility"]:checked')]
      .map(({ value }) => value)
  }

  render()
})

filters.addEventListener('reset', () => {
  state.query = ''
  state.status = 'all'
  state.facilities = []
  queueMicrotask(render)
})

document.querySelector('#clear-filters').addEventListener('click', () => filters.reset())

locateButton.addEventListener('click', async () => {
  locateButton.disabled = true
  locateButton.textContent = '正在定位…'
  locationStatus.textContent = '正在获取位置，不会保存坐标…'

  const result = await requestLocation(navigator.geolocation)

  if (result.ok) {
    state.origin = result.coords
    locationStatus.textContent = '已按本次位置重算演示距离（不会保存）'
    render()
  } else {
    locationStatus.textContent = result.message
  }

  locateButton.textContent = '重新定位'
  locateButton.disabled = false
})

render()
renderRanking()

const ERRORS = {
  1: ['denied', '定位权限被拒绝，继续使用沙市中心区默认位置。'],
  2: ['unavailable', '暂时无法获得位置，继续使用默认位置。'],
  3: ['timeout', '定位超时，继续使用默认位置。']
}

export function requestLocation(geolocation) {
  if (!geolocation) {
    return Promise.resolve({
      ok: false,
      reason: 'unsupported',
      message: '当前浏览器不支持定位，继续使用默认位置。'
    })
  }

  return new Promise((resolve) => {
    geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        ok: true,
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      }),
      (error) => {
        const [reason, message] = ERRORS[error.code] ?? [
          'unknown',
          '没有获得位置，继续使用默认位置。'
        ]

        resolve({ ok: false, reason, message })
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000
      }
    )
  })
}

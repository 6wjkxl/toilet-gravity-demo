const normalize = (value) => String(value ?? '')
  .trim()
  .toLocaleLowerCase('zh-CN')

export function buildSearchText(toilet) {
  return normalize([
    toilet.name,
    toilet.address,
    toilet.entranceDescription
  ].join(' '))
}

export function filterToilets(
  toilets,
  { query = '', status = 'all', facilities = [] } = {}
) {
  const needle = normalize(query)

  return toilets.filter((toilet) => {
    const matchesQuery = !needle || buildSearchText(toilet).includes(needle)
    const matchesStatus = status === 'all' || toilet.status === status
    const matchesFacilities = facilities.every((facility) => (
      toilet.facilities.includes(facility)
    ))

    return matchesQuery && matchesStatus && matchesFacilities
  })
}

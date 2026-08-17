export function element(tag, { className = '', text = '', attrs = {} } = {}) {
  const node = document.createElement(tag)

  if (className) node.className = className
  node.textContent = text

  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value)
  }

  return node
}

export function replaceChildren(node, children) {
  node.replaceChildren(...children)
  return node
}

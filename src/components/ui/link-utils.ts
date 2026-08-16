export const textLinkClasses = "text-primary underline-offset-4 hover:underline"

export function isInternalHref(href: string) {
  return href.startsWith("/")
}

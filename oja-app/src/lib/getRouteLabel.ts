export function getRouteLabel(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      // hide UUIDs / numeric IDs
      /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)
        ? "details"
        : segment,
    )
    .join("/");
}

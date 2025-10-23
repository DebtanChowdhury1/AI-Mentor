export type RouteParamsContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

export async function getRouteParam(context: RouteParamsContext, key: string) {
  const params = (await context.params) ?? {};
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// Turn Deno's already super simplified http server into this madness

interface Routes {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  handler: Deno.ServeHandler;
  route: string;
}

export default class NetAbstractor {
  private routes: Routes[] = [];
  private init_callback: (() => unknown)[] = [];

  public init(callback: () => unknown | Promise<unknown>) {
    this.init_callback.push(callback);
  }

  public get(route = "/", handler: Deno.ServeHandler) {
    this.routes.push({ method: "GET", handler, route });
  }

  public post(route = "/", handler: Deno.ServeHandler) {
    this.routes.push({ method: "POST", handler, route });
  }

  public patch(route = "/", handler: Deno.ServeHandler) {
    this.routes.push({ method: "PATCH", handler, route });
  }

  public delete(route = "/", handler: Deno.ServeHandler) {
    this.routes.push({ method: "DELETE", handler, route });
  }

  public serve() {
    this.init_callback.forEach(async (v) => {
      await v();
    });

    return Deno.serve(async (req, info) => {
      const route = this.routes.filter(
        (v) =>
          v.method === req.method.toUpperCase() &&
          v.route.toLowerCase() === new URL(req.url).pathname
      )[0];
      if (route === undefined)
        return new Response("not found", {
          status: 404,
        });
      return await route.handler(req, info);
    });
  }
}

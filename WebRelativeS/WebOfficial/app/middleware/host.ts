module.exports = () => {
  return async function gzip(ctx, next) {
    const host:string = ctx.host
    const pathname = ctx.URL.pathname
    const bannedUrl:string = `pic.hfcdn.tech`
    if (host.includes(bannedUrl)) {
      if (!pathname.includes('/share/product_preview/')) {
        ctx.status = 404
      } else {
        await next();
      }
    } else {
      await next();
    }

  };
};
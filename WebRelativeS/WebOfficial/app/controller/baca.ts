import { Controller } from 'egg';
import bacaArtcile from '../lib/bacaArtcile';
import { articleItem } from '../interface/baca';

export default class HomeController extends Controller {
  async share ():Promise<void> {
    await this.ctx.render('baca/share.ejs')
  }
  async article ():Promise<void> {
    const { ctx } = this
    const id:string = ctx.params.date_id
    const data:articleItem | undefined = bacaArtcile[id]
    if (data) {
      await ctx.render('baca/article.ejs', {data})
    } else {
      await ctx.render('/404.ejs')
    }
  }
}

export interface NavItem {
  title: {
    [key: string]: string
  },
  url?: string,
  children?: Array<any> | undefined,
  pageTitle?: string,
  meta?: any,
  slide?: boolean,
  select: boolean,
  icon: string
}

export interface comtomsHeader {
  title: string,
  meta?: any,
}

export interface routeItem {
  component: unknown,
  url: string,
  props: {
    title?: {
      [key: string]: string
    } | string,
    meta?: object
  }
}
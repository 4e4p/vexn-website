module.exports={
  async rewrites(){return [{source:'/',destination:'/landing.html'}]},
  async redirects(){return [
    {source:'/signin',destination:'/login',permanent:false},
    {source:'/signup',destination:'/login',permanent:false},
    {source:'/claim',destination:'/login',permanent:false},
    {source:'/sample',destination:'/demo',permanent:false},
    {source:'/features',destination:'/#features',permanent:false},
    {source:'/pricing',destination:'/#pricing',permanent:false},
  ]}
}

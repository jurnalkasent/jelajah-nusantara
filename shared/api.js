window.Api = (() => {
  const cfg = () => window.APP_CONFIG || {};
  async function request(url, options={}) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`API HTTP ${response.status}`);
    const data = await response.json();
    if (data.success === false) throw new Error(data.message || "Permintaan gagal");
    return data;
  }
  return {
    get(action="bootstrap", params={}) {
      const u = new URL(cfg().API_URL);
      u.searchParams.set("action", action);
      Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
      return request(u.href, {method:"GET",cache:"no-store"});
    },
    post(payload, idToken) {
      const body = {...payload};
      if (idToken) body.idToken = idToken;
      return request(cfg().API_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify(body)
      });
    }
  };
})();
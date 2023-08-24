(function () {
  modal = new bootstrap.Modal(document.getElementById("modal"));
  console.log(typeof modal)
  var index = document.getElementById("index")
//

  htmx.on("htmx:afterSwap", (e) => {
    console.log("Afterswap")
    if (e.detail.target.id === "dialog") { 
      modal.show();
    }
  })

  htmx.on('htmx:beforeSwap', (e) => {
    console.log("BeforeSwap")
    if (e.detail.target.id === "dialog" && !e.detail.xhr.response)
        console.log("closed")
  })

  htmx.on("form-submitted", (e) => {
    location.reload();
  })

  htmx.on('show.bs.modal', (e) => {
    console.log("Modal Shown")
  })


  htmx.on('hidden.bs.modal', (e) => {
    document.getElementById('dialog').innerHTML = ''
  })

})();


    setTimeout(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
    
        const pandaModal = urlParams.get('pandaModal') || null
    
        if(pandaModal){
            $('.vtex-modal-layout-0-x-modal--modal-primeira-compra').css("display", "none");
            document.getElementById("overlayModalnews").style.display = "block";
            document.getElementById("showModalnews").style.display = "block";
        }
      }, 2000)

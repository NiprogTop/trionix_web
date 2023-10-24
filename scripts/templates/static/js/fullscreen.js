document.getElementById('fullscreen').onclick = function(){
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        }
    }
}

let screen_controle = function(){
    document.getElementById('settings').style.display == 'block' ? document.getElementById('settings').style.display = 'none' : document.getElementById('settings').style.display = 'none';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'none' : document.getElementById('black_page').style.display = 'none';
    document.getElementById('menu__toggle').checked = false;
}



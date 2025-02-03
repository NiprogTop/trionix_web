// scripts.js

document.addEventListener('DOMContentLoaded', function() {

    const sidebar = document.querySelector('.sidebar');
    
    const toggleButton = document.createElement('button');
    
    toggleButton.textContent = 'Toggle Sidebar';
    
    toggleButton.style.position = 'fixed';
    
    toggleButton.style.top = '10px';
    
    toggleButton.style.left = '10px';
    
    document.body.appendChild(toggleButton);
    
    toggleButton.addEventListener('click', function() {
    
    if (sidebar.style.width === '0px') {
    
    sidebar.style.width = '250px';
    
    document.querySelector('.content').style.marginLeft = '250px';
    
    } else {
    
    sidebar.style.width = '0px';
    
    document.querySelector('.content').style.marginLeft = '0px';
    
    }
    
    });
    
    });
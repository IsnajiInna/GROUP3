
$(document).ready(function () {
    console.log("Admin Panel Script Initialized.");

    // ---cache jQuery selections ---
    const sidebar = $('#sidebar');
    const contentWrapper = $('#content-wrapper');
    const sidebarCollapseBtn = $('#sidebarCollapse');
    const overlay = $('.overlay'); 
    const mainViews = $('.main-view');
  
    const allViewLinks = $('a.sidebar-link');
    const logoutLinks = $('#logout-link, #logout-link-top');

    

    /**
     * Hides all main content views and shows the target view with a fade effect.
     * @param {string} targetViewId - The ID of the view to show (e.g., '#dashboard-view').
     */
    function showView(targetViewId) {
        if (!targetViewId || targetViewId === '#') {
            console.warn("showView called with invalid target:", targetViewId);
            return;
        }
        mainViews.hide(); 
        try {
            const targetElement = $(targetViewId);
            if (targetElement.length) {
                targetElement.fadeIn(200); 
                console.log("Showing view:", targetViewId);
            } else {
                console.error("Target view not found:", targetViewId);
                $('#dashboard-view').fadeIn(200); 
            }
        } catch (e) {
            console.error("Error finding or fading in view:", targetViewId, e);
            $('#dashboard-view').fadeIn(200); 
        }
    }

    /**
     * Updates the 'active' class on sidebar links (targets the LI element).
     * @param {HTMLElement} linkElement - The specific sidebar link element (<a>) to activate.
     */
    function setActiveSidebarLink(linkElement) {
        if (!linkElement) return; 
        const $linkElement = $(linkElement);
        
        if ($linkElement.closest('#sidebar').length === 0) {
            console.warn("Attempted to set active link on element outside sidebar:", linkElement);
            return;
        }

        $('#sidebar li.active').removeClass('active'); 

        const currentLi = $linkElement.closest('li');
        currentLi.addClass('active');

     
        const parentUl = currentLi.closest('ul.collapse');
        if (parentUl.length) {
            const parentLi = parentUl.parent('li');
            parentLi.addClass('active');
        
            if (!parentUl.hasClass('show')) {
                const collapseInstance = bootstrap.Collapse.getInstance(parentUl[0]) || new bootstrap.Collapse(parentUl[0]);
                if (collapseInstance) { 
                   collapseInstance.show();
                }
            }
        }
    }

    // ---mobile Sidebar toggle---
    if (sidebarCollapseBtn.length && sidebar.length) {
        sidebarCollapseBtn.on('click', function () {
            console.log("Sidebar toggle button clicked!"); 
            sidebar.toggleClass('active');
         
            if (overlay.length) {
                overlay.toggleClass('active', sidebar.hasClass('active'));
            }
        });
    } else {
        console.warn("Sidebar or Sidebar Collapse Button not found.");
    }



    if (overlay.length) {
 
        $('body').on('click', '.overlay.active', function() {
            console.log("Overlay clicked!"); 
            if (sidebar.hasClass('active')) {
                sidebar.removeClass('active');
                overlay.removeClass('active');
            }
        });
    }

  
    $(document).on('click', 'a.sidebar-link', function (e) {
        const $this = $(this);
        const targetView = $this.attr('href');
        const isDropdownToggle = $this.attr('data-bs-toggle') === 'collapse';
        const isInsideSidebar = $this.closest('#sidebar').length > 0;

        
        if (targetView && targetView.startsWith('#') && targetView.length > 1 && !isDropdownToggle) {
            e.preventDefault(); 

           
            const correspondingSidebarLink = $(`#sidebar a.sidebar-link[href="${targetView}"]`);
            if (correspondingSidebarLink.length > 0) {
                 setActiveSidebarLink(correspondingSidebarLink[0]); 
            } else {
                
                 $('#sidebar li.active').removeClass('active');
                 console.warn("No corresponding sidebar link found for:", targetView);
            }
        

       
            showView(targetView);

           
            if ($(window).width() <= 767.98 && sidebar.hasClass('active')) {
                 sidebar.removeClass('active');
                 if (overlay.length) overlay.removeClass('active');
            }
        }
       
        else if (isDropdownToggle && isInsideSidebar) {
          
             setActiveSidebarLink(this); 

            
            if (targetView === '#') {
                e.preventDefault();
            }
        }
      
        else if (targetView === '#') {
             e.preventDefault();
        }
       
    });


    
    function initializeActiveView() {
     
        let initialActiveLink = $('#sidebar li.active > a.sub-link');
        if (!initialActiveLink.length) {
            initialActiveLink = $('#sidebar li.active > a.sidebar-link:not([data-bs-toggle="collapse"])');
        }

        const initialActiveHref = initialActiveLink.attr('href');

        if (initialActiveHref && initialActiveHref.startsWith('#') && initialActiveHref.length > 1) {
            showView(initialActiveHref); 

           
            const parentUl = initialActiveLink.closest('ul.collapse');
             if (parentUl && parentUl.length) {
                 const parentLi = parentUl.parent('li');
                  if (parentLi.length && !parentLi.hasClass('active')) {
                    
                     parentLi.addClass('active');
                 }
                 if (!parentUl.hasClass('show')) {
                     const collapseInstance = bootstrap.Collapse.getInstance(parentUl[0]) || new bootstrap.Collapse(parentUl[0]);
                     if(collapseInstance) collapseInstance.show();
                 }
            }
        } else {
            
            showView('#dashboard-view');
            
            if ($('#sidebar li.active').length === 0) {
                const dashboardLink = $('#sidebar a.sidebar-link[href="#dashboard-view"]');
                if (dashboardLink.length > 0) {
                   setActiveSidebarLink(dashboardLink[0]);
                }
            }
        }
    }
    initializeActiveView(); 


    // --- Logout Link 
    logoutLinks.on('click', function(e) {
        const href = $(this).attr('href');
        
        if (!href || href === '#') {
            e.preventDefault();
            console.log("Logout action triggered via JS!");
            alert("Logout functionality placeholder. Redirecting..."); // Placeholder alert
            window.location.href = 'index.html'; 
        } else {
            console.log("Following logout link href:", href);
           
        }
    });


}); 

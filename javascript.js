document.addEventListener('DOMContentLoaded', () => {
    console.log("CCS Inventory System Initialized.");

    // --- Get Global Elements ---
    const views = document.querySelectorAll('.view-section');
    const sidebarLinks = document.querySelectorAll('.sidebar a[data-view]');
    const statusMessageContainer = document.getElementById('status-message');
    const appHeaderSearch = document.querySelector('.app-header .search-bar');

    // --- Get Settings Specific Elements ---
    const settingsTabsContainer = document.querySelector('.settings-tabs');
    const settingsTabButtons = document.querySelectorAll('.settings-tab-button');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');

    // --- Get Other Interactive Elements ---
    const requestButtons = document.querySelectorAll('.request-button');
    const requestSpecificButtons = document.querySelectorAll('.request-specific-button');
    const borrowRequestForm = document.getElementById('borrow-request-form');
    const termsCheckbox = document.getElementById('terms-agree');
    const submitBorrowRequestButton = document.getElementById('submit-borrow-request');
    const backButtons = document.querySelectorAll('.back-button');
    const returnItemButtons = document.querySelectorAll('.return-item-button');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const preferencesForm = document.getElementById('preferences-form');
    const deleteAccountButton = document.querySelector('.settings-delete-button');


    // --- Helper Function to Show/Hide Header Search ---
    function toggleHeaderSearch(viewId) {
        const showOn = appHeaderSearch?.getAttribute('data-show-on');
        if (appHeaderSearch && showOn) {
            if (showOn.split(',').includes(viewId)) {
                appHeaderSearch.style.display = 'flex';
            } else {
                appHeaderSearch.style.display = 'none';
            }
        } else if (appHeaderSearch) {
             appHeaderSearch.style.display = 'none'; // Default hide if not specified
        }
    }

    // --- Helper Function to Switch Main Views ---
    function showView(viewIdToShow) {
        statusMessageContainer.classList.add('view-hidden'); // Hide status on view change
        statusMessageContainer.textContent = '';

        let foundView = false;
        views.forEach(view => {
            if (view.id === viewIdToShow) {
                view.classList.remove('view-hidden');
                foundView = true;
            } else {
                view.classList.add('view-hidden');
            }
        });

        // Update active class on sidebar
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-view') === viewIdToShow);
        });

        // Show/Hide header search based on view
        toggleHeaderSearch(viewIdToShow);

        if (!foundView && views.length > 0) {
             console.warn(`View ID "${viewIdToShow}" not found. Defaulting to first view.`);
             views[0].classList.remove('view-hidden');
             sidebarLinks.forEach(link => {
                 link.classList.toggle('active', link.getAttribute('data-view') === views[0].id);
             });
              toggleHeaderSearch(views[0].id);
        }

        window.scrollTo(0, 0); // Scroll to top
    }

     // --- Helper Function to Show Status Message ---
    function showStatusMessage(message, isSuccess = true) {
        statusMessageContainer.textContent = message;
        statusMessageContainer.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
        statusMessageContainer.classList.remove('view-hidden');
        // Optional: Hide after a few seconds
        // setTimeout(() => { statusMessageContainer.classList.add('view-hidden'); }, 4000);
    }

    // --- Event Listeners ---

    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = link.getAttribute('data-view');
            if (viewId) {
                showView(viewId);
                if (viewId !== 'borrowed-items-view') { resetReturnButtons(); }
                 // Reset settings tab if navigating away
                if(viewId !== 'settings-view' && settingsTabButtons.length > 0) {
                    switchSettingsTab(settingsTabButtons[0]); // Go back to first tab
                }
            }
        });
    });

    // Back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetViewId = button.getAttribute('data-target-view');
            if (targetViewId) { showView(targetViewId); }
        });
    });

    // --- Browse Equipment Workflow ---
    requestButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemType = button.getAttribute('data-item-type') || 'Items';
            document.getElementById('specific-item-type').textContent = itemType.charAt(0).toUpperCase() + itemType.slice(1);
            showView('specific-item-view');
        });
    });

    requestSpecificButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemCode = button.getAttribute('data-item-code');
            console.log(`Requesting specific item: ${itemCode}`);
             if (borrowRequestForm) borrowRequestForm.reset();
            showView('request-form-view');
        });
    });

    if(borrowRequestForm) {
        borrowRequestForm.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Borrow form submitted (details would be processed here)');
            if (termsCheckbox) termsCheckbox.checked = false;
            if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = true;
            showView('terms-view');
        });
    }

    if(termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
           if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = !termsCheckbox.checked;
        });
    }

    if(submitBorrowRequestButton) {
        submitBorrowRequestButton.addEventListener('click', () => {
            if (termsCheckbox && !termsCheckbox.checked) return;
            console.log('FINAL SUBMIT: Borrow request sent!');
            showStatusMessage('Borrow request submitted successfully!');
            setTimeout(() => { showView('equipment-list-view'); }, 2500);
        });
    }

    // --- My Borrowed Items Workflow ---
    returnItemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemCode = button.getAttribute('data-item-code');
            console.log(`Attempting to return item: ${itemCode}`);
            button.textContent = 'PENDING';
            button.classList.add('pending');
            button.disabled = true;
            showStatusMessage('YOU HAVE SUCCESSFULLY RETURN THE ITEM. PLEASE WAIT FOR THE NOTIFICATION APPROVED BY THE ADMIN');
        });
    });

    function resetReturnButtons() {
         const pendingButtons = document.querySelectorAll('#borrowed-items-view .return-item-button.pending');
         pendingButtons.forEach(button => {
             button.textContent = 'Return Item';
             button.classList.remove('pending');
             button.disabled = false;
         });
    }

    // --- Settings Workflow ---
    function switchSettingsTab(targetButton) {
        const targetTabId = targetButton.getAttribute('data-tab-target');

        // Update button active states
        settingsTabButtons.forEach(btn => {
            btn.classList.toggle('active', btn === targetButton);
        });

        // Show/hide content panes
        settingsTabContents.forEach(content => {
            content.classList.toggle('view-hidden', content.id !== targetTabId);
        });
    }

    if (settingsTabsContainer) {
        settingsTabsContainer.addEventListener('click', (event) => {
            if (event.target.matches('.settings-tab-button')) {
                switchSettingsTab(event.target);
            }
        });
    }

    // Settings Form Submissions (Placeholders)
    if(profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Profile form submitted");
            showStatusMessage("Profile updated successfully!");
        });
    }
     if(passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Password form submitted");
            // Add validation logic here (e.g., new passwords match)
             showStatusMessage("Password updated successfully!");
             passwordForm.reset(); // Clear form
        });
    }
     if(preferencesForm) {
        preferencesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Preferences form submitted");
            showStatusMessage("Preferences saved successfully!");
        });
    }
    if(deleteAccountButton) {
        deleteAccountButton.addEventListener('click', () => {
            // IMPORTANT: Add a confirmation dialog here!
            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                 console.log("Account deletion initiated");
                 showStatusMessage("Account deletion requested.", false); // Show as error/warning
                 // Add actual deletion logic here (API call etc.)
            }
        });
    }


    // --- Initial State ---
    const initialView = 'home-view'; // Start on the Home view
    showView(initialView);
    // Ensure correct settings tab is shown initially if settings is default view
    if (initialView === 'settings-view' && settingsTabButtons.length > 0) {
         switchSettingsTab(settingsTabButtons[0]); // Show first tab
    }

});

// Sidebar Navigation
sidebarLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Stop the link from doing anything else
        // Get the value 'settings-view' from the data-view attribute when you click the Settings link
        const viewId = link.getAttribute('data-view');
        if (viewId) {
            // Call the function to show the view with the ID 'settings-view'
            showView(viewId);

            // --- Additional logic run when a sidebar link is clicked ---
            // If navigating away from borrowed items, reset return buttons
            if (viewId !== 'borrowed-items-view') {
                resetReturnButtons();
            }
            // If navigating away from settings, reset to the first settings tab
            if (viewId !== 'settings-view' && settingsTabButtons.length > 0) {
                // Get the first tab button and call switchSettingsTab
                const firstSettingsTabButton = settingsTabsContainer.querySelector('.settings-tab-button');
                if(firstSettingsTabButton) {
                   switchSettingsTab(firstSettingsTabButton);
                }
            }
            // If navigating TO settings, make sure the first tab is active initially
            if (viewId === 'settings-view' && settingsTabButtons.length > 0) {
                 const firstSettingsTabButton = settingsTabsContainer.querySelector('.settings-tab-button');
                if(firstSettingsTabButton) {
                   switchSettingsTab(firstSettingsTabButton);
                }
            }
        }
    });
});
function showView(viewIdToShow) {
    // ... (hides status message) ...

    // Loop through all view divs
    views.forEach(view => {
        // If the div's ID matches 'settings-view', remove 'view-hidden' (Show it)
        // If the div's ID doesn't match, add 'view-hidden' (Hide it)
        view.classList.toggle('view-hidden', view.id !== viewIdToShow);
    });

    // Update sidebar: Add 'active' class to the Settings link, remove from others
    sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-view') === viewIdToShow);
    });

    // ... (other logic like header search toggle, scroll to top) ...
}

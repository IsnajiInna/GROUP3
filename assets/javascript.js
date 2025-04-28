document.addEventListener('DOMContentLoaded', () => {
    console.log("CCS Inventory System Initialized.");

    const views = document.querySelectorAll('.view-section');
    const sidebarLinks = document.querySelectorAll('.sidebar a[data-view]');
    const statusMessageContainer = document.getElementById('status-message');
    const appHeaderSearch = document.querySelector('.app-header .search-bar');
    const appContainer = document.querySelector('.app-container');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button');
    const sidebar = document.querySelector('.sidebar');
    const notificationLink = document.getElementById('notification-link');
    const profileDropdown = document.getElementById('profileDropdown');
    const userDropdownItems = document.querySelectorAll('.user-profile .dropdown-item');

    const settingsTabsContainer = document.querySelector('.settings-tabs');
    const settingsTabButtons = document.querySelectorAll('.settings-tab-button');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');

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

    if (sidebarToggleButton && appContainer && sidebar) {
        sidebarToggleButton.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-visible');
        });

        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992 && appContainer.classList.contains('sidebar-visible')) {
                    appContainer.classList.remove('sidebar-visible');
                }
            });
        });

        // Optional: Close sidebar when clicking outside of it (on the main content area or overlay)
        document.addEventListener('click', (e) => {
            if (appContainer.classList.contains('sidebar-visible') &&
                !sidebar.contains(e.target) &&
                !sidebarToggleButton.contains(e.target) &&
                window.innerWidth <= 992 )
            {
                appContainer.classList.remove('sidebar-visible');
            }
        }, true); // Use capture phase

    }

    function toggleHeaderSearch(viewId) {
        const showOn = appHeaderSearch?.getAttribute('data-show-on');
        if (appHeaderSearch && showOn) {
            const allowedViews = showOn.split(',').map(v => v.trim());
            if (allowedViews.includes(viewId)) {
                appHeaderSearch.style.display = 'flex';
            } else {
                appHeaderSearch.style.display = 'none';
            }
        } else if (appHeaderSearch) {
             appHeaderSearch.style.display = 'none';
        }
    }

    // --- Helper Function to Switch Main Views ---
    function showView(viewIdToShow) {
        if (statusMessageContainer) {
            statusMessageContainer.classList.add('view-hidden');
            statusMessageContainer.textContent = '';
        } else {
            console.warn("Status message container not found.");
        }

        let foundView = false;
        views.forEach(view => {
            if (view.id === viewIdToShow) {
                view.classList.remove('view-hidden');
                foundView = true;
            } else {
                view.classList.add('view-hidden');
            }
        });

        if (!foundView && views.length > 0) {
             console.warn(`View ID "${viewIdToShow}" not found. Defaulting to first view: ${views[0].id}`);
             viewIdToShow = views[0].id;
             views[0].classList.remove('view-hidden');
             views.forEach((view, index) => {
                if(index !== 0) view.classList.add('view-hidden');
             });
        }

        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-view') === viewIdToShow);
        });

        toggleHeaderSearch(viewIdToShow);

        window.scrollTo(0, 0);

         if (viewIdToShow !== 'borrowed-items-view') {
            resetReturnButtons();
        }
        if (viewIdToShow !== 'settings-view' && settingsTabButtons.length > 0) {
            const firstSettingsTabButton = settingsTabsContainer?.querySelector('.settings-tab-button');
            if(firstSettingsTabButton) {
               switchSettingsTab(firstSettingsTabButton);
            }
        } else if (viewIdToShow === 'settings-view' && settingsTabButtons.length > 0) {
             const firstSettingsTabButton = settingsTabsContainer?.querySelector('.settings-tab-button');
            if(firstSettingsTabButton) {
                 const activeTab = settingsTabsContainer.querySelector('.settings-tab-button.active');
                 if (!activeTab || activeTab !== firstSettingsTabButton) {
                      switchSettingsTab(firstSettingsTabButton);
                 }
            }
        }

    }

    function showStatusMessage(message, isSuccess = true) {
        if (!statusMessageContainer) {
            console.error("Cannot show status message: Container not found.");
            alert(`${isSuccess ? 'Success' : 'Error'}: ${message}`);
            return;
        }
        statusMessageContainer.textContent = message;
        statusMessageContainer.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
        statusMessageContainer.classList.remove('view-hidden');

    }

    function resetReturnButtons() {
         const pendingButtons = document.querySelectorAll('#borrowed-items-view .return-item-button.pending');
         pendingButtons.forEach(button => {
             button.textContent = 'Return Item';
             button.classList.remove('pending');
             button.disabled = false;
         });
    }

    function switchSettingsTab(targetButton) {
        if (!targetButton || !settingsTabsContainer) return;

        const targetTabId = targetButton.getAttribute('data-tab-target');
        if (!targetTabId) {
            console.warn("Settings tab button clicked without 'data-tab-target'.", targetButton);
            return;
        }

        settingsTabButtons.forEach(btn => {
            btn.classList.toggle('active', btn === targetButton);
        });

        let foundContent = false;
        settingsTabContents.forEach(content => {
             const isTarget = content.id === targetTabId;
             content.classList.toggle('view-hidden', !isTarget);
             if(isTarget) foundContent = true;
        });

        if (!foundContent) {
            console.warn(`Settings tab content with ID "${targetTabId}" not found.`);
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = link.getAttribute('data-view');
            if (viewId) {
                showView(viewId);
            } else {
                console.warn("Sidebar link clicked without a data-view attribute:", link);
            }
        });
    });

    if (notificationLink) {
        notificationLink.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = notificationLink.getAttribute('data-view');
            if (viewId) {
                showView(viewId);
            } else {
                console.warn("Notification link clicked without data-view attribute.");
            }
             const dropdownMenu = profileDropdown?.nextElementSibling;
             if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown && dropdownMenu?.classList.contains('show')) {
                 const dropdownInstance = bootstrap.Dropdown.getInstance(profileDropdown);
                 if (dropdownInstance) {
                    dropdownInstance.hide();
                 }
             }
        });
    } else {
        console.warn("Notification link element not found.");
    }

     if (userDropdownItems.length > 0 && profileDropdown) {
        userDropdownItems.forEach(item => {
            item.addEventListener('click', (event) => {
                const viewId = item.getAttribute('data-view');
                const logoutHref = item.getAttribute('href');

                if (viewId) {
                    event.preventDefault();
                    showView(viewId);
                    if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                        const dropdownInstance = bootstrap.Dropdown.getInstance(profileDropdown);
                        if (dropdownInstance) {
                            dropdownInstance.hide();
                        }
                    }
                }
                else if (logoutHref && logoutHref !== '#') {
                    console.log("Logout link clicked.");
                    // event.preventDefault(); // Uncomment for JS logout logic
                    // showStatusMessage("Logging out...");
                    // --- Placeholder for API call/interaction ---
                    // setTimeout(() => { window.location.href = logoutHref; }, 1000);
                }
            });
        });
     } else {
        console.warn("User profile dropdown items or toggle element not found.");
     }


    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetViewId = button.getAttribute('data-target-view');
            if (targetViewId) {
                showView(targetViewId);
            } else {
                console.warn("Back button clicked without a data-target-view attribute:", button);
            }
        });
    });

    requestButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemType = button.getAttribute('data-item-type') || 'Items';
            const specificItemTypeSpan = document.getElementById('specific-item-type');
            if (specificItemTypeSpan) {
                specificItemTypeSpan.textContent = itemType.charAt(0).toUpperCase() + itemType.slice(1);
                showView('specific-item-view');
            } else {
                console.error("Element with ID 'specific-item-type' not found.");
                showStatusMessage("Error navigating to item list.", false);
            }
        });
    });

    requestSpecificButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemCode = button.getAttribute('data-item-code');
            if (!itemCode) {
                console.error("Request specific button clicked without 'data-item-code'.");
                showStatusMessage("Error: Could not identify item to request.", false);
                return;
            }
            console.log(`Requesting specific item: ${itemCode}`);
            if (borrowRequestForm) borrowRequestForm.reset();
            if (termsCheckbox) termsCheckbox.checked = false;
            if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = true;
            showView('request-form-view');
        });
    });

    if(borrowRequestForm) {
        borrowRequestForm.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Borrow form submitted');
            showView('terms-view');
            if (termsCheckbox) termsCheckbox.checked = false;
            if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = true;
        });
    }

    if(termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
           if (submitBorrowRequestButton) {
                submitBorrowRequestButton.disabled = !termsCheckbox.checked;
           }
        });
    }

    if(submitBorrowRequestButton) {
        submitBorrowRequestButton.addEventListener('click', () => {
            if (termsCheckbox && !termsCheckbox.checked) {
                showStatusMessage("Please agree to the terms and conditions.", false);
                return;
            }
            console.log('FINAL SUBMIT: Borrow request sent!');
            // --- Placeholder for API call/interaction ---
            showStatusMessage('Borrow request submitted successfully!');
            setTimeout(() => {
                showView('equipment-list-view');
                if(borrowRequestForm) borrowRequestForm.reset();
                if(termsCheckbox) termsCheckbox.checked = false;
                submitBorrowRequestButton.disabled = true;
            }, 2500);
        });
    }

    returnItemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemCode = button.getAttribute('data-item-code');
             if (!itemCode) {
                console.error("Return item button clicked without 'data-item-code'.");
                showStatusMessage("Error: Could not identify item to return.", false);
                return;
            }
            console.log(`Attempting to initiate return for item: ${itemCode}`);
            // --- Placeholder for API call/interaction ---
            button.textContent = 'PENDING RETURN';
            button.classList.add('pending');
            button.disabled = true;
            showStatusMessage('Return request initiated. Please wait for admin approval/confirmation.');
        });
    });

    if (settingsTabsContainer) {
        settingsTabsContainer.addEventListener('click', (event) => {
            if (event.target.matches('.settings-tab-button')) {
                switchSettingsTab(event.target);
            }
        });
    }

    if(profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Profile form submitted");
            // --- Placeholder for API call/interaction ---
            showStatusMessage("Profile updated successfully!");
        });
    }
     if(passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Password form submitted");
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            if (newPassword !== confirmPassword) {
                 showStatusMessage("New passwords do not match.", false);
                 return;
            }
            if (!newPassword || newPassword.length < 8) {
                 showStatusMessage("New password must be at least 8 characters.", false);
                 return;
            }
            // --- Placeholder for API call/interaction ---
             showStatusMessage("Password updated successfully!");
             passwordForm.reset();
        });
    }
     if(preferencesForm) {
        preferencesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Preferences form submitted");
            // --- Placeholder for API call/interaction ---
            showStatusMessage("Preferences saved successfully!");
        });
    }
    if(deleteAccountButton) {
        deleteAccountButton.addEventListener('click', () => {
            if (confirm("ARE YOU ABSOLUTELY SURE?\n\nThis action cannot be undone. This will permanently delete your account and all associated data.\n\nClick 'OK' to proceed.")) {
                if (confirm("FINAL CONFIRMATION:\n\nAre you absolutely certain you want to delete your account?")) {
                    console.log("Account deletion initiated");
                    // --- Placeholder for API call/interaction ---
                    showStatusMessage("Account deletion request processed.", false);
                    // Example: window.location.href = '/logout';
                } else {
                     console.log("Account deletion cancelled (second confirmation).");
                }
            } else {
                 console.log("Account deletion cancelled (first confirmation).");
            }
        });
    }

    const initialView = 'home-view';
    showView(initialView);

}); 
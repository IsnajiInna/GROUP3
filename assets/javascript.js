document.addEventListener('DOMContentLoaded', () => {
    console.log("CCS Inventory System User Interface Initialized.");

    // --- Global Element Selectors ---
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

    // --- View Specific Element Selectors ---
    const settingsTabsContainer = document.querySelector('.settings-tabs');
    const settingsTabButtons = document.querySelectorAll('.settings-tab-button');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');
    const requestButtons = document.querySelectorAll('.request-button');
    const requestSpecificButtons = document.querySelectorAll('.request-specific-button'); 
    const borrowRequestForm = document.getElementById('borrow-request-form');
    const requestFormItemNameSpan = document.getElementById('request-form-item-name');
    const termsCheckbox = document.getElementById('terms-agree');
    const submitBorrowRequestButton = document.getElementById('submit-borrow-request'); 
    const backButtons = document.querySelectorAll('.back-button');
    const returnItemButtons = document.querySelectorAll('.return-item-button'); 
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const preferencesForm = document.getElementById('preferences-form');
    const deleteAccountButton = document.querySelector('.settings-delete-button');

    // --- Modal Specific Element Selectors ---
    const returnItemModal = document.getElementById('returnItemModal');
    const returnItemForm = document.getElementById('returnItemForm');
    const returnModalItemNameSpan = document.getElementById('return-modal-item-name');
    const returnItemCodeInput = document.getElementById('returnItemCodeInput');
    const returnConditionSelect = document.getElementById('returnConditionSelect');
    const returnReasonNotes = document.getElementById('returnReasonNotes');
    const submitReturnButton = document.getElementById('submitReturnButton');
    const logoutConfirmationModal = document.getElementById('logoutConfirmationModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

    // Bootstrap Modal Instances
    const bsReturnItemModal = returnItemModal ? new bootstrap.Modal(returnItemModal) : null;
    const bsLogoutModal = logoutConfirmationModal ? new bootstrap.Modal(logoutConfirmationModal) : null;

    // --- Sidebar Toggle Functionality ---
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

        document.addEventListener('click', (e) => {
            if (appContainer.classList.contains('sidebar-visible') &&
                !sidebar.contains(e.target) &&
                !sidebarToggleButton.contains(e.target) &&
                window.innerWidth <= 992 )
            {
                appContainer.classList.remove('sidebar-visible');
            }
        }, true);
    }

    // --- Helper Functions ---

    function toggleHeaderSearch(viewId) {
        const showOn = appHeaderSearch?.getAttribute('data-show-on');
        if (appHeaderSearch && showOn) {
            const allowedViews = showOn.split(',').map(v => v.trim());
            appHeaderSearch.style.display = allowedViews.includes(viewId) ? 'flex' : 'none';
        } else if (appHeaderSearch) {
             appHeaderSearch.style.display = 'none';
        }
    }

    function showView(viewIdToShow) {
        if (statusMessageContainer) {
            statusMessageContainer.classList.add('view-hidden');
            statusMessageContainer.textContent = '';
        }

        let foundView = false;
        views.forEach(view => {
            const isTarget = view.id === viewIdToShow;
            view.classList.toggle('view-hidden', !isTarget);
            if (isTarget) foundView = true;
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

        // Reset states for specific views when navigating away/to them
        if (viewIdToShow !== 'borrowed-items-view') {
            // (No reset needed for return buttons here anymore as modal handles state)
        }
        if (viewIdToShow !== 'settings-view' && settingsTabButtons.length > 0) {
            const firstSettingsTabButton = settingsTabsContainer?.querySelector('.settings-tab-button');
            if(firstSettingsTabButton) switchSettingsTab(firstSettingsTabButton);
        } else if (viewIdToShow === 'settings-view' && settingsTabButtons.length > 0) {
            const firstSettingsTabButton = settingsTabsContainer?.querySelector('.settings-tab-button');
            if(firstSettingsTabButton) {
                 const activeTab = settingsTabsContainer.querySelector('.settings-tab-button.active');
                 if (!activeTab || activeTab !== firstSettingsTabButton) switchSettingsTab(firstSettingsTabButton);
            }
        }
    }

    function showStatusMessage(message, isSuccess = true) {
        if (!statusMessageContainer) {
            console.error("Status message container not found.");
            alert(`${isSuccess ? 'Success' : 'Error'}: ${message}`); // Fallback
            return;
        }
        statusMessageContainer.textContent = message;
        statusMessageContainer.className = 'status-message-bar'; // Reset classes
        statusMessageContainer.classList.add(isSuccess ? 'status-success' : 'status-error');
        statusMessageContainer.classList.remove('view-hidden');
       
    }

    function switchSettingsTab(targetButton) {
        if (!targetButton || !settingsTabsContainer) return;
        const targetTabId = targetButton.getAttribute('data-tab-target');
        if (!targetTabId) return;

        settingsTabButtons.forEach(btn => btn.classList.toggle('active', btn === targetButton));
        settingsTabContents.forEach(content => content.classList.toggle('view-hidden', content.id !== targetTabId));
    }

    // --- Event Listeners ---

    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = link.getAttribute('data-view');
            if (viewId) {
                showView(viewId);
            } else {
                // Allow default behavior for non-view links (like potential logout link if not using modal)
                // Or handle specific hrefs if needed
                if (link.getAttribute('href') !== '#') {
                    window.location.href = link.getAttribute('href');
                }
            }
        });
    });

    // Top Navbar Links (Notifications, Profile Dropdown Items)
    if (notificationLink) {
        notificationLink.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = notificationLink.getAttribute('data-view');
            if (viewId) showView(viewId);
        });
    }

    if (userDropdownItems.length > 0) {
        userDropdownItems.forEach(item => {
            item.addEventListener('click', (event) => {
                const viewId = item.getAttribute('data-view');
                const isModalTrigger = item.getAttribute('data-bs-toggle') === 'modal';

                if (viewId && !isModalTrigger) { // Handle view navigation links
                    event.preventDefault();
                    showView(viewId);
                    // Close dropdown if Bootstrap JS is loaded
                    if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown && profileDropdown) {
                        const dropdownInstance = bootstrap.Dropdown.getInstance(profileDropdown);
                        if (dropdownInstance) dropdownInstance.hide();
                    }
                }
                // Allow default behavior for modal triggers and other hrefs
            });
        });
     }

    // Back Buttons
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetViewId = button.getAttribute('data-target-view');
            if (targetViewId) showView(targetViewId);
            else history.back(); // Fallback to browser back if no target specified
        });
    });

    // --- Borrowing Workflow ---

    // Browse Equipment -> Specific Item View
    requestButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemType = button.getAttribute('data-item-type') || 'Items';
            const specificItemTypeSpan = document.getElementById('specific-item-type');
            if (specificItemTypeSpan) {
                specificItemTypeSpan.textContent = itemType.charAt(0).toUpperCase() + itemType.slice(1);
                showView('specific-item-view');
                // TODO: Add logic here to dynamically load items of 'itemType' into #specific-item-view grid
            } else {
                showStatusMessage("Error showing item list.", false);
            }
        });
    });

    // Specific Item View -> Request Form
    requestSpecificButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemCode = button.getAttribute('data-item-code');
            const itemName = button.closest('.item-details').querySelector('p:first-of-type strong + span')?.textContent || // Try getting name from card
                             button.closest('.item-details').querySelector('p:first-of-type')?.textContent.replace('Item Name:', '').trim() || // Fallback
                             'Selected Item'; // Default

            if (!itemCode) {
                showStatusMessage("Error: Could not identify item code.", false);
                return;
            }
            console.log(`Requesting specific item: ${itemCode}`);

            if (requestFormItemNameSpan) {
                 requestFormItemNameSpan.textContent = itemName; // Update form title
            }
            // Store item code somewhere accessible by the form submission, e.g., data attribute
            if(borrowRequestForm) borrowRequestForm.setAttribute('data-requesting-item-code', itemCode);

            if (borrowRequestForm) borrowRequestForm.reset();
            if (termsCheckbox) termsCheckbox.checked = false;
            if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = true;
            showView('request-form-view');
        });
    });

    // Request Form Submission (Proceed to Terms)
    if (borrowRequestForm) {
        borrowRequestForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Add validation for dates, purpose if needed
            console.log('Borrow form details captured, proceeding to terms.');
            showView('terms-view');
            if (termsCheckbox) termsCheckbox.checked = false;
            if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = true;
        });
    }

    // Terms Agreement Checkbox
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
           if (submitBorrowRequestButton) submitBorrowRequestButton.disabled = !termsCheckbox.checked;
        });
    }

    // Final Borrow Request Submission (After agreeing to terms)
    if (submitBorrowRequestButton) {
        submitBorrowRequestButton.addEventListener('click', () => {
            if (termsCheckbox && !termsCheckbox.checked) {
                showStatusMessage("Please agree to the terms and conditions.", false);
                return;
            }
            const itemCode = borrowRequestForm?.getAttribute('data-requesting-item-code');
            const dateNeeded = document.getElementById('date-needed')?.value;
            const returnDate = document.getElementById('return-date')?.value;
            const purpose = document.getElementById('purpose')?.value;

            console.log(`FINAL SUBMIT: Requesting ${itemCode} from ${dateNeeded} to ${returnDate} for purpose: ${purpose}`);
            // --- Placeholder for API call/interaction to submit the request ---
            showStatusMessage('Borrow request submitted successfully!', true);
            setTimeout(() => {
                showView('equipment-list-view'); // Or user's dashboard/history
                if(borrowRequestForm) {
                    borrowRequestForm.reset();
                    borrowRequestForm.removeAttribute('data-requesting-item-code');
                }
                if(termsCheckbox) termsCheckbox.checked = false;
                submitBorrowRequestButton.disabled = true;
            }, 2500);
        });
    }

    // --- Return Item Workflow ---

    // Populate Return Item Modal when shown
    if (returnItemModal) {
        returnItemModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget; // Button that triggered the modal
            const itemName = button.getAttribute('data-item-name') || 'Item';
            const itemCode = button.getAttribute('data-item-code');

            if (returnModalItemNameSpan) returnModalItemNameSpan.textContent = itemName;
            if (returnItemCodeInput) returnItemCodeInput.value = itemCode;

            // Reset form fields within the modal
            if(returnItemForm) returnItemForm.reset();
        });
    }

    // Handle Submission from Return Item Modal
    if (submitReturnButton) {
        submitReturnButton.addEventListener('click', () => {
            const itemCode = returnItemCodeInput?.value;
            const condition = returnConditionSelect?.value;
            const reason = returnReasonNotes?.value.trim();

            // Basic Validation
            if (!itemCode) {
                showStatusMessage("Error: Item code missing.", false);
                return;
            }
            if (!condition) {
                showStatusMessage("Please select the condition of the item.", false);
                returnConditionSelect?.focus();
                return;
            }
            if (!reason) {
                showStatusMessage("Please provide a reason or note for the return.", false);
                returnReasonNotes?.focus();
                return;
            }

            console.log(`Submitting return for ${itemCode}: Condition='${condition}', Reason='${reason}'`);
            // --- Placeholder for API call/interaction to submit return request ---
            // This API call should send itemCode, condition, reason to the backend.
            // The backend marks it as 'Pending Return Confirmation' or similar.

            showStatusMessage('Return request submitted. Waiting for admin confirmation.', true);
            if(bsReturnItemModal) bsReturnItemModal.hide();

            // Update the button 
            const originalButton = document.querySelector(`.return-item-button[data-item-code="${itemCode}"]`);
            if (originalButton) {
                originalButton.textContent = 'Return Pending';
                originalButton.disabled = true;
                 originalButton.classList.add('pending'); // Add class for potential styling
            }
        });
    }

    // --- Settings Workflow ---

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
            // --- Placeholder ---
            showStatusMessage("Profile updated successfully!");
        });
    }
     if(passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            console.log("Password form submitted");
            if (!currentPassword || !newPassword || !confirmPassword) {
                showStatusMessage("Please fill in all password fields.", false); return;
            }
            if (newPassword !== confirmPassword) {
                 showStatusMessage("New passwords do not match.", false); return;
            }
            if (newPassword.length < 8) {
                 showStatusMessage("New password must be at least 8 characters.", false); return;
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
            if (confirm("ARE YOU SURE you want to delete your account?\nThis action CANNOT be undone.")) {
                 console.log("Account deletion initiated");
                 // --- Placeholder for API call/interaction ---
                 showStatusMessage("Account deletion request processed.", false);
            }
        });
    }

     // --- Logout Confirmation Modal Logic ---
     if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            console.log("Logout confirmed by user.");
           
            showStatusMessage("Logging out...", true);
            if (bsLogoutModal) bsLogoutModal.hide();
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '../index.html'; 
            }, 1000);
        });
    }

    // --- Initial State ---
    const initialView = 'home-view';
    showView(initialView);

}); // --- End  ---

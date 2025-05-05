$(document).ready(function () {
    console.log("Admin Panel Refactored Script Initialized.");

    // --- Cache jQuery Selections ---
    const sidebar = $('#sidebar');
    const contentWrapper = $('#content-wrapper');
    const sidebarCollapseBtn = $('#sidebarCollapse');
    const overlay = $('.overlay');
    const mainViews = $('.main-view'); 
    const allSidebarLinks = $('#sidebar a.sidebar-link'); 
    const topNavLinks = $('#top-navbar a.sidebar-link'); 
    const profileDropdownLinks = $('#profileDropdown + .dropdown-menu a.sidebar-link');
    const notificationViewLinks = $('.view-notification-link'); 
    const logoutModalTriggerLinks = $('[data-bs-target="#logoutConfirmationModal"]'); 

    // Equipment Filter Controls
    const equipmentSearchInput = $('#equipmentSearchInput');
    const equipmentCategoryFilter = $('#equipmentCategoryFilter');
    const equipmentStatusFilter = $('#equipmentStatusFilter');
    const equipmentTableBody = $('#equipmentTableBody');
    const noEquipmentResultsDiv = $('#noEquipmentResults');
    const resetEquipmentFiltersBtn = $('#resetEquipmentFiltersBtn');

    // Modals 
    const addEquipmentModalEl = document.getElementById('addEquipmentModal');
    const addEquipmentModalInstance = addEquipmentModalEl ? new bootstrap.Modal(addEquipmentModalEl) : null;

    const editEquipmentModalEl = document.getElementById('editEquipmentModal');
    const editEquipmentModalInstance = editEquipmentModalEl ? new bootstrap.Modal(editEquipmentModalEl) : null;

    const viewRequestDetailsModalEl = document.getElementById('viewRequestDetailsModal');
    const viewRequestDetailsModalInstance = viewRequestDetailsModalEl ? new bootstrap.Modal(viewRequestDetailsModalEl) : null;

    const viewStockDetailsModalEl = document.getElementById('viewStockDetailsModal');
    const viewStockDetailsModalInstance = viewStockDetailsModalEl ? new bootstrap.Modal(viewStockDetailsModalEl) : null;

    const viewReturnDetailsModalEl = document.getElementById('viewReturnDetailsModal');
    const viewReturnDetailsModalInstance = viewReturnDetailsModalEl ? new bootstrap.Modal(viewReturnDetailsModalEl) : null;

    const editUserModalEl = document.getElementById('editUserModal');
    const editUserModalInstance = editUserModalEl ? new bootstrap.Modal(editUserModalEl) : null;

    const confirmUserStatusModalEl = document.getElementById('confirmUserStatusModal');
    const confirmUserStatusModalInstance = confirmUserStatusModalEl ? new bootstrap.Modal(confirmUserStatusModalEl) : null;

    const confirmUserDeleteModalEl = document.getElementById('confirmUserDeleteModal');
    const confirmUserDeleteModalInstance = confirmUserDeleteModalEl ? new bootstrap.Modal(confirmUserDeleteModalEl) : null;

    const logoutConfirmationModalEl = document.getElementById('logoutConfirmationModal');
    const logoutConfirmationModalInstance = logoutConfirmationModalEl ? new bootstrap.Modal(logoutConfirmationModalEl) : null;


    // --- Helper Functions ---

    /**
     * Shows a status message using a Bootstrap alert.
     * @param {string} message - The message to display.
     * @param {string} [type='success'] - The alert type (success, info, warning, danger).
     * @param {number} [duration=3000] - Duration in ms before auto-dismiss. 0 for permanent.
     */
    function showStatusMessage(message, type = 'success', duration = 3000) {
        const alertType = ['success', 'info', 'warning', 'danger'].includes(type) ? type : 'success';
        $('.status-alert').remove(); // Remove previous alerts quickly
        const statusDiv = $(`
            <div class="status-alert alert alert-${alertType} alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1100;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        $('body').append(statusDiv);
        if (duration > 0) {
            setTimeout(() => {
                statusDiv.fadeOut(500, function() { $(this).remove(); });
            }, duration);
        }
    }


    /**
     * Hides all main content views and shows the target view with a fade effect.
     * Scrolls to the top of the content area.
     * @param {string} targetViewId - The ID of the view to show (e.g., '#dashboard-view').
     * @param {string} [targetTabId] - Optional. The ID of a specific tab button to activate within the target view.
     */
    function showView(targetViewId, targetTabId = null) {
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

                if (targetTabId) {
                    // Find the button that triggers the target tab pane
                    const tabButton = $(`#borrowRequestTabs button[data-bs-target="#${targetTabId}-pane"], #${targetTabId}`);
                    if (tabButton.length && tabButton.is('button[data-bs-toggle="tab"], a[data-bs-toggle="tab"]')) {
                         try {
                            const tabInstance = bootstrap.Tab.getInstance(tabButton[0]) || new bootstrap.Tab(tabButton[0]);
                            if (tabInstance) {
                                tabInstance.show();
                                console.log("Activating tab associated with button:", tabButton.attr('id') || targetTabId);
                            } else { console.error("Could not get/create Tab instance for:", tabButton[0]); }
                         } catch (tabError) { console.error("Error activating tab:", targetTabId, tabError); }
                    } else { console.warn("Target tab trigger button not found or invalid:", targetTabId); }
                }

                $('#main-content').scrollTop(0);
                // Optionally update URL hash
                // if (history.pushState) { history.pushState(null, null, targetViewId); } else { window.location.hash = targetViewId; }

            } else {
                console.error("Target view not found:", targetViewId);
                $('#dashboard-view').fadeIn(200);
                setActiveSidebarLink($('#sidebar a.sidebar-link[href="#dashboard-view"]')[0]);
            }
        } catch (e) {
            console.error("Error finding or fading in view:", targetViewId, e);
            $('#dashboard-view').fadeIn(200);
            setActiveSidebarLink($('#sidebar a.sidebar-link[href="#dashboard-view"]')[0]);
        }
    }

    /**
     * Updates the 'active' class on sidebar links (targets the LI element).
     * Handles nested submenus. Also handles activating based on non-sidebar links.
     * @param {HTMLElement} linkElement - The specific link element (<a>) that was clicked or corresponds to the view.
     */
    function setActiveSidebarLink(linkElement) {
        if (!linkElement) return;
        const $linkElement = $(linkElement);
        let targetHref = $linkElement.attr('href');
        let $actualSidebarLink = $linkElement;

        if ($linkElement.closest('#sidebar').length === 0) {
            const correspondingSidebarLink = $(`#sidebar a.sidebar-link[href="${targetHref}"]`);
            if (correspondingSidebarLink.length > 0) {
                 $actualSidebarLink = correspondingSidebarLink;
            } else {
                console.warn("No corresponding sidebar link found for:", targetHref);
                $('#sidebar li.active').removeClass('active');
                $('#sidebar ul.collapse.show').each(function() {
                    const collapseInstance = bootstrap.Collapse.getInstance(this);
                    if (collapseInstance) collapseInstance.hide();
                });
                return;
            }
        }

        $('#sidebar li.active').removeClass('active');
        const currentLi = $actualSidebarLink.closest('li');
        currentLi.addClass('active');

        const parentUl = currentLi.closest('ul.collapse');
        if (parentUl.length) {
            const parentLi = parentUl.closest('li');
            if (parentLi.length) {
                 parentLi.addClass('active');
                 if (!parentUl.hasClass('show')) {
                    const collapseInstance = bootstrap.Collapse.getInstance(parentUl[0]) || new bootstrap.Collapse(parentUl[0]);
                    if (collapseInstance) collapseInstance.show();
                 }
            }
        }
        $('#sidebar ul.collapse.show').not(parentUl).each(function() {
             if (!$(this).closest('li').hasClass('active')) {
                 const collapseInstance = bootstrap.Collapse.getInstance(this);
                 if (collapseInstance) collapseInstance.hide();
             }
        });
    }

    // --- Mobile Sidebar Toggle ---
    if (sidebarCollapseBtn.length && sidebar.length) {
        sidebarCollapseBtn.on('click', function () {
            sidebar.toggleClass('active');
            overlay.toggleClass('active', sidebar.hasClass('active'));
        });
    }

    // --- Overlay Click to Close Sidebar ---
    if (overlay.length) {
        $('body').on('click', '.overlay.active', function() {
            if (sidebar.hasClass('active')) {
                sidebar.removeClass('active');
                overlay.removeClass('active');
            }
        });
    }

    // --- Unified View Switching Logic ---
    function handleViewLinkClick(event, linkElement) {
        const $link = $(linkElement);
        const targetView = $link.attr('href');
        // Get target tab ID from data attribute (e.g., data-tab-target="pending-tab")
        const targetTab = $link.data('tab-target');
        const isDropdownToggle = $link.attr('data-bs-toggle') === 'collapse';
        const isModalToggle = $link.attr('data-bs-toggle') === 'modal';

        if (isModalToggle) { return; } // Let Bootstrap handle modals

        if (targetView && targetView.startsWith('#') && targetView.length > 1 && !isDropdownToggle) {
            event.preventDefault();
            setActiveSidebarLink(linkElement);
            showView(targetView, targetTab); // Pass targetTab ID

            if ($(window).width() <= 767.98 && sidebar.hasClass('active')) {
                 sidebar.removeClass('active');
                 if (overlay.length) overlay.removeClass('active');
            }
        }
        else if (isDropdownToggle && $link.closest('#sidebar').length > 0) {
             setActiveSidebarLink(linkElement);
             if (targetView === '#') event.preventDefault();
        }
        else if (targetView === '#') {
             event.preventDefault();
        }
    }

    // Use delegation for all view links
     $(document).on('click', 'a.sidebar-link', function(e) { handleViewLinkClick(e, this); });


    // --- Initialize View on Page Load ---
    function initializeActiveView() {
        const hash = window.location.hash;
        let targetViewId = '#dashboard-view';
        let $initialLink = $('#sidebar a.sidebar-link[href="#dashboard-view"]');

        if (hash && hash.length > 1 && $(hash).hasClass('main-view')) {
            targetViewId = hash;
            const $linkForHash = $(`a.sidebar-link[href="${hash}"]`);
            if ($linkForHash.length > 0) {
                $initialLink = $linkForHash.first();
            } else { $initialLink = null; }
            console.log("Attempting init from hash:", targetViewId);
        } else {
            let $activeHtmlLink = $('#sidebar li.active > a.sub-link');
            if (!$activeHtmlLink.length) {
                $activeHtmlLink = $('#sidebar li.active > a.sidebar-link:not([data-bs-toggle="collapse"])');
            }
            const activeHtmlHref = $activeHtmlLink.attr('href');
            if (activeHtmlHref && activeHtmlHref.startsWith('#') && activeHtmlHref.length > 1) {
                 targetViewId = activeHtmlHref;
                 $initialLink = $activeHtmlLink;
                 console.log("Init from active HTML link:", targetViewId);
            } else { console.log("Defaulting to dashboard."); }
        }

        if ($initialLink && $initialLink.length > 0) {
            setActiveSidebarLink($initialLink[0]);
        } else {
             $('#sidebar li.active').removeClass('active');
             $('#sidebar ul.collapse.show').each(function() {
                 const collapseInstance = bootstrap.Collapse.getInstance(this);
                 if (collapseInstance) collapseInstance.hide();
             });
        }
        showView(targetViewId);
    }
    initializeActiveView();

    // --- Logout Modal Logic ---
    $('#confirmLogoutBtn').on('click', function() {
        console.log("Logout Confirmed");
        showStatusMessage("Logging out...", "info", 2000);
        if (logoutConfirmationModalInstance) logoutConfirmationModalInstance.hide();
        // Add actual logout logic (clear session/token, API call)
        setTimeout(() => {
            // Adjust path based on deployment structure
            window.location.href = '../../index.html'; // Assumes admin is 2 levels down
        }, 500);
    });

    // --- Equipment Management Logic ---

    // Add Equipment Form Submission (Placeholder)
    $('#addEquipmentForm').on('submit', function(e) {
        e.preventDefault();
        console.log("Add Equipment Form Submitted (Placeholder)");
        // --- Placeholder for API call ---
        showStatusMessage("Equipment added successfully!", "success");
        if (addEquipmentModalInstance) addEquipmentModalInstance.hide();
        $(this)[0].reset();
        // TODO: Function to refresh or prepend to the equipment table
        // refreshEquipmentTable();
    });

    // Edit Equipment - Populate Modal
    if (editEquipmentModalEl) {
        editEquipmentModalEl.addEventListener('show.bs.modal', function (event) {
            const button = $(event.relatedTarget);
            const modal = $(this);
            // Populate fields from button's data attributes
            modal.find('#editItemId').val(button.data('item-id'));
            modal.find('#editItemCode').val(button.data('item-code'));
            modal.find('#editItemName').val(button.data('item-name'));
            modal.find('#editItemCategory').val(button.data('item-category'));
            modal.find('#editItemQuantity').val(button.data('item-quantity'));
            modal.find('#editItemBrand').val(button.data('item-brand') || '');
            modal.find('#editItemSerial').val(button.data('item-serial') || '');
            modal.find('#editItemRemarks').val(button.data('item-remarks') || '');

            const imageUrl = button.data('item-image-url') || null;
            const previewImg = modal.find('#editImagePreview img');
            const noImageSpan = modal.find('#editImagePreview span');
            if (imageUrl) {
                previewImg.attr('src', imageUrl).show(); noImageSpan.hide();
            } else {
                previewImg.hide().attr('src', ''); noImageSpan.show();
            }
            modal.find('#editItemImage').val(''); // Reset file input
        });
    }

    // Edit Equipment - Save Changes (Placeholder)
    $('#saveEquipmentChangesBtn').on('click', function() {
        console.log("Save Equipment Changes Clicked (Placeholder)");
        const itemId = $('#editItemId').val();
        // --- Placeholder for API call ---
        showStatusMessage("Equipment updated successfully!", "success");
        if (editEquipmentModalInstance) editEquipmentModalInstance.hide();
        // TODO: Function to refresh the specific table row
        // refreshEquipmentTableRow(itemId);
    });

     // Delete Equipment Confirmation (Placeholder)
     $('#manage-equipment-view').on('click', '.delete-equipment-btn', function() {
        const button = $(this);
        const itemId = button.data('item-id');
        const itemName = button.data('item-name');
        if (confirm(`ARE YOU SURE?\n\nDelete equipment type "${itemName}" (${itemId}) and ALL its units?\nThis cannot be undone.`)) {
            console.log(`Delete Equipment Confirmed: ${itemId} (Placeholder)`);
            // --- Placeholder for API call ---
            showStatusMessage(`Equipment type ${itemName} deleted.`, "success");
            button.closest('tr').fadeOut(300, function() { $(this).remove(); filterEquipmentTable(); }); // Re-run filter after delete
        }
    });

    // View Stock Details - Populate Modal (Placeholder)
    if (viewStockDetailsModalEl) {
        viewStockDetailsModalEl.addEventListener('show.bs.modal', function(event) {
            const button = $(event.relatedTarget);
            const itemCode = button.data('item-code');
            const itemName = button.data('item-name');
            const modal = $(this);

            modal.find('#stockDetailItemName').text(itemName || 'N/A');
            modal.find('#stockDetailItemCode').text(itemCode || 'N/A');
            const tableBody = modal.find('#stockDetailsTableBody');
            tableBody.html('<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm"></div> Loading...</td></tr>');

            // --- !!! Placeholder: Replace with API call !!! ---
            console.log(`Fetching stock for ${itemCode} (Placeholder)`);
            setTimeout(() => { // Simulate fetch
                const exampleData = [ // Replace with actual fetched data
                    { unitId: 'LP123', serial: 'SN_LP123', status: 'Available', condition: 'Good', borrowerName: null, dueDate: null },
                    { unitId: 'LP124', serial: 'SN_LP124', status: 'Borrowed', condition: 'Good', borrowerName: 'Jelord Bojos', dueDate: '3/25/2025' },
                    { unitId: 'LP125', serial: 'SN_LP125', status: 'Available', condition: 'Fair', borrowerName: null, dueDate: null }
                ];
                 tableBody.empty();
                 if (exampleData.length > 0) {
                     exampleData.forEach(unit => {
                        const statusBadge = unit.status === 'Available' ? 'bg-success-light text-success' : 'bg-danger-light text-danger';
                        const disabled = unit.status !== 'Available' ? 'disabled' : '';
                        const row = `
                            <tr data-unit-id="${unit.unitId}">
                                <td>${unit.serial || unit.unitId || 'N/A'}</td>
                                <td><span class="badge ${statusBadge}">${unit.status}</span></td>
                                <td>${unit.condition || 'N/A'}</td>
                                <td>${unit.borrowerName || '-'}</td>
                                <td>${unit.dueDate || '-'}</td>
                                <td><button class="btn btn-xs btn-outline-secondary edit-unit-btn" ${disabled}>Edit Unit</button></td>
                            </tr>`;
                        tableBody.append(row);
                    });
                 } else { tableBody.html('<tr><td colspan="6" class="text-center text-muted">No individual units found.</td></tr>'); }
            }, 800);
            // --- End Placeholder ---
        });
    }


    // *** Equipment Table Filtering Logic ***
    function filterEquipmentTable() {
        const searchTerm = equipmentSearchInput.val().toLowerCase().trim();
        const selectedCategory = equipmentCategoryFilter.val();
        const selectedStatus = equipmentStatusFilter.val();
        let rowsFound = 0; // Use a counter

        equipmentTableBody.find('tr').each(function() {
            const $row = $(this);
            const rowCategory = $row.data('category');
            const rowStatusTags = $row.data('status-tags') ? $row.data('status-tags').split(',') : [];
            const rowText = $row.text().toLowerCase(); // Includes name, code, brand/model from added small tag

            let showRow = true;

            // Search Term Check
            if (searchTerm && rowText.indexOf(searchTerm) === -1) { // More efficient check
                showRow = false;
            }

            // Category Check
            if (showRow && selectedCategory && rowCategory !== selectedCategory) {
                showRow = false;
            }

            // Status Check
            if (showRow && selectedStatus) {
                switch (selectedStatus) {
                    case 'available':
                        if (!rowStatusTags.includes('available')) showRow = false;
                        break;
                    case 'borrowed': // Fully Borrowed / Overdue (meaning NOT available)
                        if (rowStatusTags.includes('available')) showRow = false;
                        break;
                    case 'overdue':
                        if (!rowStatusTags.includes('overdue')) showRow = false;
                        break;
                    // Add cases for other statuses like 'needs_repair' if you add those tags
                }
            }

            // Toggle row visibility and count visible rows
            if (showRow) {
                $row.show();
                rowsFound++;
            } else {
                $row.hide();
            }
        });

        // Show/hide "No Results" message
        noEquipmentResultsDiv.toggle(rowsFound === 0);
    }

    // Attach event listeners to filter controls
    equipmentSearchInput.on('input keyup', filterEquipmentTable); // Trigger on input change or key release
    equipmentCategoryFilter.on('change', filterEquipmentTable);
    equipmentStatusFilter.on('change', filterEquipmentTable);

    // Reset Filters Button
    resetEquipmentFiltersBtn.on('click', function() {
        equipmentSearchInput.val('');
        equipmentCategoryFilter.val('');
        equipmentStatusFilter.val('');
        filterEquipmentTable(); // Re-apply filters to show all
    });
    // *** END Equipment Table Filtering Logic ***


     // --- Borrow Request Logic (Approve/Reject Placeholders) ---
    $('#borrow-requests-view').on('click', '.approve-request-btn', function() {
        const button = $(this);
        const requestId = button.data('request-id');
        console.log(`Approve Request Clicked: ${requestId} (Placeholder)`);
        // --- Placeholder for API call ---
        showStatusMessage(`Request ${requestId} approved.`, "success");
        // TODO: Move row dynamically to approved tab table after API success
        button.closest('tr').fadeOut(300, function() { $(this).remove(); });
    });

    $('#borrow-requests-view').on('click', '.reject-request-btn', function() {
        const button = $(this);
        const requestId = button.data('request-id');
        const reason = prompt(`Enter reason for rejecting request ${requestId} (optional):`);
        if (reason === null) return; // User cancelled prompt
        console.log(`Reject Request Clicked: ${requestId}, Reason: ${reason} (Placeholder)`);
        // --- Placeholder for API call ---
        showStatusMessage(`Request ${requestId} rejected.`, "warning");
        // TODO: Move row dynamically to rejected tab table after API success
        button.closest('tr').fadeOut(300, function() { $(this).remove(); });
    });

    // --- Borrowed Items / Confirm Return Logic ---

    // Populate View Return Details Modal
    if (viewReturnDetailsModalEl) {
        viewReturnDetailsModalEl.addEventListener('show.bs.modal', function(event) {
            const button = $(event.relatedTarget);
            const modal = $(this);
            modal.find('#viewReturnBorrowId').val(button.data('borrow-id'));
            modal.find('#viewReturnItemName').text(button.data('item-name') || 'Item');
            modal.find('#viewReturnStudentName').text(button.data('student-name') || 'Student');
            modal.find('#viewReturnCondition').text(button.data('return-condition') || 'N/A');
            modal.find('#viewReturnNotes').text(button.data('return-notes') || 'No notes provided by borrower.');
        });
    }

    // Confirm Return - Acknowledge Button Action (Placeholder)
    $('#confirmReturnAcknowledgeBtn').on('click', function() {
        const borrowId = $('#viewReturnBorrowId').val();
        console.log(`Admin Acknowledged Return: ID=${borrowId} (Placeholder)`);
        // --- Placeholder for API call to finalize return ---
        showStatusMessage(`Return for record ${borrowId} acknowledged.`, "success");
        if (viewReturnDetailsModalInstance) viewReturnDetailsModalInstance.hide();
        // TODO: Update UI (both approved table and history table)
        // Example of updating just the button area:
         const targetButton = $(`.confirm-return-btn[data-borrow-id="${borrowId}"]`);
         if(targetButton.length) {
             targetButton.each(function() {
                 $(this).closest('td').html('<span class="text-muted fst-italic">Completed</span>');
             });
             // Ideally, refresh the whole table or relevant rows after API call
         }
    });

    // --- User Management Modal & Action Placeholders ---

    // Edit User - Populate
    if (editUserModalEl) {
        editUserModalEl.addEventListener('show.bs.modal', function(event) {
            var button = $(event.relatedTarget);
            $(this).find('#editUserId').val(button.data('user-id'));
            $(this).find('#editUserName').val(button.data('user-name'));
            $(this).find('#editUserEmail').val(button.data('user-email'));
        });
    }

    // Edit User - Save (Placeholder)
    $('#saveUserChangesBtn').on('click', function() {
        const userId = $('#editUserId').val();
        console.log(`Save User Changes for ${userId} (Placeholder)`);
        // --- Placeholder for API call ---
        showStatusMessage("User details updated.", "success");
        if (editUserModalInstance) editUserModalInstance.hide();
        // TODO: Refresh user table row
    });

    // Confirm Status Change - Populate
    if (confirmUserStatusModalEl) {
        confirmUserStatusModalEl.addEventListener('show.bs.modal', function(event) {
            var button = $(event.relatedTarget);
            var action = button.data('action');
            var modal = $(this);
            modal.find('#userStatusAction').text(action);
            modal.find('#userStatusName').text(button.data('user-name'));
            modal.find('#confirmStatusUserId').val(button.data('user-id'));
            modal.find('#confirmStatusAction').val(action);
            var confirmBtn = modal.find('#confirmUserStatusBtn');
            confirmBtn.removeClass('btn-success btn-info btn-danger btn-primary');
            confirmBtn.text(`Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`);
            confirmBtn.addClass(action === 'activate' ? 'btn-success' : 'btn-info');
        });
    }

     // Confirm Status Change - Action (Placeholder)
    $('#confirmUserStatusBtn').on('click', function() {
        const userId = $('#confirmStatusUserId').val();
        const action = $('#confirmStatusAction').val();
        console.log(`Confirm User Status: User ${userId}, Action: ${action} (Placeholder)`);
        // --- Placeholder for API call ---
        showStatusMessage(`User ${action}d successfully.`, "success");
        if (confirmUserStatusModalInstance) confirmUserStatusModalInstance.hide();
         // TODO: Refresh user table row status/buttons
    });

    // Confirm Delete - Populate
    if (confirmUserDeleteModalEl) {
         confirmUserDeleteModalEl.addEventListener('show.bs.modal', function(event) {
             var button = $(event.relatedTarget);
             $(this).find('#userDeleteName').text(button.data('user-name'));
             $(this).find('#confirmDeleteUserId').val(button.data('user-id'));
         });
     }

    // Confirm Delete - Action (Placeholder)
    $('#confirmUserDeleteBtn').on('click', function() {
        const userId = $('#confirmDeleteUserId').val();
        console.log(`Confirm User Delete: ${userId} (Placeholder)`);
        
        showStatusMessage(`User deleted successfully.`, "success");
        if (confirmUserDeleteModalInstance) confirmUserDeleteModalInstance.hide();
        // TODO: Remove user table row dynamically
         $(`#user-management-view tr[data-user-row-id="${userId}"]`).fadeOut(300, function() { $(this).remove(); });
    });

}); // --- END DOCUMENT READY ---

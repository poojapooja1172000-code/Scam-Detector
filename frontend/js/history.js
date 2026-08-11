"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/history.js

   Handles:
   1. History page login protection
   2. Dynamic navbar and logout
   3. Loading only the logged-in user's scans
   4. Searching by URL or domain
   5. Beautiful View Details modal
   6. Loading spinner
   7. Toast notifications
   8. Deleting the logged-in user's scans
   9. Mobile navigation
   10. Empty-history display
   ============================================================ */


document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     1. PROTECT HISTORY PAGE
     ============================================================ */

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  const loggedInUserId =
    localStorage.getItem("loggedInUserId");

  if (!isLoggedIn || !loggedInUserId) {

    alert("Please log in to view scan history.");

    window.location.href = "login.html";

    return;
  }


  /* ============================================================
     2. GET HTML ELEMENTS
     ============================================================ */

  const navToggle =
    document.querySelector(".nav-toggle");

  const navLinks =
    document.querySelector(".nav-links");

  const historySearch =
    document.getElementById("historySearch");

  const historyTableBody =
    document.getElementById("historyTableBody");

  const historyTableWrapper =
    document.querySelector(".history-table-wrapper");

  const emptyState =
    document.querySelector(".history-empty-state");


  /* ============================================================
     3. DYNAMIC NAVBAR AND LOGOUT
     ============================================================ */

  function updateNavbarForLogin() {

    if (!navLinks) return;

    const loggedInUser =
      localStorage.getItem("loggedInUser") || "User";

    navLinks.innerHTML = `
      <li>
        <a href="index.html" class="nav-link">
          Home
        </a>
      </li>

      <li>
        <a href="history.html" class="nav-link active">
          History
        </a>
      </li>

      <li>
        <span class="nav-link">
          Hi, ${escapeHtml(loggedInUser)}
        </span>
      </li>

      <li>
        <button
          type="button"
          id="logoutBtn"
          class="nav-link nav-link--register"
        >
          Logout
        </button>
      </li>
    `;

    const logoutBtn =
      document.getElementById("logoutBtn");

    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        logoutUser
      );
    }
  }


  /* ============================================================
     LOGOUT
     ============================================================ */

  function logoutUser() {

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("loggedInUser");

    localStorage.removeItem("loggedInEmail");

    localStorage.removeItem("loggedInUserId");

    /* Remembered email is intentionally kept */

    alert("Logged out successfully.");

    window.location.href = "login.html";
  }


  /* ============================================================
     4. LOAD USER'S HISTORY FROM MONGODB
     ============================================================ */

  async function loadHistory() {

    if (!historyTableBody) return;

    try {

      const response = await fetch(
        `http://localhost:5000/api/scan/history?userId=${encodeURIComponent(
          loggedInUserId
        )}`
      );

      const data = await response.json();

      if (!response.ok) {

        showToast(
          data.message ||
          "Could not load scan history.",
          "error"
        );

        return;
      }

      const scanHistory =
        Array.isArray(data.scans)
          ? data.scans
          : [];

      /* Remove old rows */

      historyTableBody.innerHTML = "";

      scanHistory.forEach(function (item) {

        const formattedItem = {

          _id: item._id,

          url: item.url,

          domain: item.domain,

          status: item.status,

          riskScore:
            item.riskScore,

          scanDate:
            formatScanDate(item.scannedAt)
        };

        const row =
          createHistoryRow(formattedItem);

        historyTableBody.appendChild(row);
      });


      /* Reapply search */

      if (
        historySearch &&
        historySearch.value.trim() !== ""
      ) {

        filterRows(
          historySearch.value
            .trim()
            .toLowerCase()
        );
      }


      checkEmptyState();

    } catch (error) {

      console.error(
        "History loading error:",
        error
      );

      showToast(
        "Could not connect to the server. Please make sure the backend is running.",
        "error"
      );
    }
  }


  /* ============================================================
     FORMAT DATE
     ============================================================ */

  function formatScanDate(scannedAt) {

    const date =
      new Date(scannedAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Unknown";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

        hour12: true
      }
    );
  }


  /* ============================================================
     5. CREATE HISTORY TABLE ROW
     ============================================================ */

  function createHistoryRow(item) {

    const row =
      document.createElement("tr");

    row.className =
      "history-table__row";

    /* Store MongoDB ID */

    row.dataset.id =
      item._id;

    row.innerHTML = `

      <td
        class="history-table__cell history-table__cell--url"
      >
        ${escapeHtml(item.url)}
      </td>

      <td class="history-table__cell">
        ${escapeHtml(item.domain)}
      </td>

      <td class="history-table__cell">

        <span
          class="history-status-badge ${getStatusBadgeClass(
            item.status
          )}"
        >
          ${escapeHtml(item.status)}
        </span>

      </td>

      <td class="history-table__cell">
        ${escapeHtml(item.riskScore)}%
      </td>

      <td class="history-table__cell">
        ${escapeHtml(item.scanDate)}
      </td>

      <td
        class="history-table__cell history-table__cell--actions"
      >

        <button
          type="button"
          class="history-action-btn history-action-btn--view"
          aria-label="View scan details for ${escapeHtml(
            item.domain
          )}"
        >
          <i
            class="fa-solid fa-eye"
            aria-hidden="true"
          ></i>

          View
        </button>


        <button
          type="button"
          class="history-action-btn history-action-btn--delete"
          aria-label="Delete scan history for ${escapeHtml(
            item.domain
          )}"
        >
          <i
            class="fa-solid fa-trash"
            aria-hidden="true"
          ></i>

          Delete
        </button>

      </td>
    `;

    return row;
  }


  /* ============================================================
     STATUS BADGE
     ============================================================ */

  function getStatusBadgeClass(status) {

    const normalizedStatus =
      String(status || "")
        .toUpperCase();

    if (
      normalizedStatus === "SCAM"
    ) {

      return "history-status-badge--scam";
    }

    if (
      normalizedStatus === "SUSPICIOUS"
    ) {

      return "history-status-badge--suspicious";
    }

    return "history-status-badge--safe";
  }


  /* ============================================================
     ESCAPE HTML
     ============================================================ */

  function escapeHtml(text) {

    const div =
      document.createElement("div");

    div.textContent =
      text === undefined ||
      text === null
        ? ""
        : String(text);

    return div.innerHTML;
  }


  /* ============================================================
     6. VIEW AND DELETE BUTTONS
     ============================================================ */

  function setupRowActions() {

    if (!historyTableBody) {

      console.error(
        "historyTableBody not found."
      );

      return;
    }

    historyTableBody.addEventListener(
      "click",
      function (event) {

        const viewBtn =
          event.target.closest(
            ".history-action-btn--view"
          );

        const deleteBtn =
          event.target.closest(
            ".history-action-btn--delete"
          );


        /* ======================================================
           VIEW BUTTON
           ====================================================== */

        if (viewBtn) {

          console.log(
            "VIEW BUTTON CLICKED"
          );

          const row =
            viewBtn.closest(
              ".history-table__row"
            );

          if (!row) {

            console.error(
              "History row not found."
            );

            return;
          }


          const scanId =
            row.dataset.id;

          console.log(
            "SCAN ID:",
            scanId
          );


          if (!scanId) {

            showToast(
              "Scan ID not found.",
              "error"
            );

            return;
          }


          handleViewClick(
            viewBtn
          );

          return;
        }


        /* ======================================================
           DELETE BUTTON
           ====================================================== */

        if (deleteBtn) {

          console.log(
            "DELETE BUTTON CLICKED"
          );

          handleDeleteClick(
            deleteBtn
          );

          return;
        }

      }
    );
  }


  /* ============================================================
     VIEW SCAN DETAILS
     ============================================================ */

  async function handleViewClick(viewBtn) {

    const row =
      viewBtn.closest(
        ".history-table__row"
      );

    if (!row) {

      showToast(
        "History row not found.",
        "error"
      );

      return;
    }


    const scanId =
      row.dataset.id;


    if (!scanId) {

      showToast(
        "Scan ID not found.",
        "error"
      );

      return;
    }


    console.log(
      "Loading scan:",
      scanId
    );


    showLoadingSpinner();


    try {

      const response =
        await fetch(
          `http://localhost:5000/api/scan/${encodeURIComponent(
            scanId
          )}?userId=${encodeURIComponent(
            loggedInUserId
          )}`
        );


      console.log(
        "View response status:",
        response.status
      );


      const data =
        await response.json();


      console.log(
        "View response data:",
        data
      );


      if (!response.ok) {

        hideLoadingSpinner();

        showToast(
          data.message ||
          "Could not load scan details.",
          "error"
        );

        return;
      }


      hideLoadingSpinner();


      const scan =
        data.scan;


      if (!scan) {

        showToast(
          "Scan details were not found.",
          "error"
        );

        return;
      }


      openScanDetailsModal(
        scan
      );

    } catch (error) {

      hideLoadingSpinner();

      console.error(
        "View scan error:",
        error
      );

      showToast(
        "Could not connect to the server. Please make sure the backend is running.",
        "error"
      );
    }
  }


  /* ============================================================
     7. BEAUTIFUL VIEW DETAILS MODAL
     ============================================================ */

  function openScanDetailsModal(scan) {

    let modal =
      document.getElementById(
        "scanDetailsModal"
      );


    /*
      Create modal container if it does not
      already exist in history.html.
    */

    if (!modal) {

      modal =
        document.createElement(
          "div"
        );

      modal.id =
        "scanDetailsModal";

      modal.className =
        "scan-modal";

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.appendChild(
        modal
      );
    }


    const status =
      String(
        scan.status || "UNKNOWN"
      ).toUpperCase();


    let statusClass =
      "suspicious";


    if (
      status === "SAFE"
    ) {

      statusClass =
        "safe";

    } else if (
      status === "SCAM"
    ) {

      statusClass =
        "scam";
    }


    let reasonsHtml =
      "";


    if (
      Array.isArray(scan.reasons) &&
      scan.reasons.length > 0
    ) {

      reasonsHtml =
        scan.reasons
          .map(
            function (reason) {

              return `
                <li>

                  <i
                    class="fa-solid fa-circle-exclamation"
                    aria-hidden="true"
                  ></i>

                  <span>
                    ${escapeHtml(reason)}
                  </span>

                </li>
              `;
            }
          )
          .join("");

    } else {

      reasonsHtml = `

        <li
          class="scan-modal__no-reasons"
        >

          <i
            class="fa-solid fa-circle-check"
            aria-hidden="true"
          ></i>

          <span>
            No suspicious patterns were found.
          </span>

        </li>

      `;
    }


    const httpsValue =
      Boolean(scan.https);


    const httpsText =
      httpsValue
        ? "Yes"
        : "No";


    const httpsIcon =
      httpsValue
        ? "fa-circle-check"
        : "fa-circle-xmark";


    const riskScore =
      scan.riskScore === undefined ||
      scan.riskScore === null
        ? "0"
        : String(
            scan.riskScore
          ).replace(
            "%",
            ""
          );


    modal.innerHTML = `

      <div
        class="scan-modal__overlay"
        id="scanModalOverlay"
      ></div>


      <div
        class="scan-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanModalTitle"
      >


        <!-- Modal Header -->

        <div
          class="scan-modal__header"
        >

          <div>

            <h2
              class="scan-modal__title"
              id="scanModalTitle"
            >

              <i
                class="fa-solid fa-shield-halved"
                aria-hidden="true"
              ></i>

              Scan Details

            </h2>

          </div>


          <button
            type="button"
            class="scan-modal__close"
            id="scanModalClose"
            aria-label="Close scan details"
          >

            <i
              class="fa-solid fa-xmark"
              aria-hidden="true"
            ></i>

          </button>

        </div>


        <!-- Modal Body -->

        <div
          class="scan-modal__body"
        >


          <!-- URL -->

          <div
            class="scan-modal__item scan-modal__item--full"
          >

            <span
              class="scan-modal__label"
            >
              Website URL
            </span>

            <span
              class="scan-modal__value scan-modal__value--url"
            >
              ${escapeHtml(scan.url)}
            </span>

          </div>


          <!-- Details Grid -->

          <div
            class="scan-modal__details"
          >


            <!-- Domain -->

            <div
              class="scan-modal__item"
            >

              <span
                class="scan-modal__label"
              >
                Domain
              </span>

              <span
                class="scan-modal__value"
              >
                ${escapeHtml(scan.domain)}
              </span>

            </div>


            <!-- HTTPS -->

            <div
              class="scan-modal__item"
            >

              <span
                class="scan-modal__label"
              >
                HTTPS
              </span>

              <span
                class="scan-modal__value"
              >

                <i
                  class="fa-solid ${httpsIcon}"
                  aria-hidden="true"
                ></i>

                ${httpsText}

              </span>

            </div>


            <!-- Status -->

            <div
              class="scan-modal__item"
            >

              <span
                class="scan-modal__label"
              >
                Status
              </span>

              <span
                class="scan-modal__status scan-modal__status--${statusClass}"
              >
                ${escapeHtml(status)}
              </span>

            </div>


            <!-- Risk Score -->

            <div
              class="scan-modal__item"
            >

              <span
                class="scan-modal__label"
              >
                Risk Score
              </span>

              <span
                class="scan-modal__value scan-modal__risk"
              >
                ${escapeHtml(riskScore)}%
              </span>

            </div>


            <!-- Scan Date -->

            <div
              class="scan-modal__item scan-modal__item--full"
            >

              <span
                class="scan-modal__label"
              >
                Scan Date
              </span>

              <span
                class="scan-modal__value"
              >
                ${escapeHtml(
                  formatScanDate(
                    scan.scannedAt
                  )
                )}
              </span>

            </div>

          </div>


          <!-- Reasons -->

          <div
            class="scan-modal__reasons"
          >

            <h3
              class="scan-modal__reasons-title"
            >
              Detection Reasons
            </h3>


            <ul
              class="scan-modal__reasons-list"
            >

              ${reasonsHtml}

            </ul>

          </div>

        </div>


        <!-- Modal Footer -->

        <div
          class="scan-modal__footer"
        >

          <button
            type="button"
            class="scan-modal__close-btn"
            id="scanModalCloseBtn"
          >
            Close
          </button>

        </div>

      </div>
    `;


    modal.classList.add(
      "scan-modal--open"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "modal-open"
    );


    /* ========================================================
       CLOSE BUTTON
       ======================================================== */

    const closeButton =
      document.getElementById(
        "scanModalClose"
      );


    /* ========================================================
       FOOTER CLOSE BUTTON
       ======================================================== */

    const closeFooterButton =
      document.getElementById(
        "scanModalCloseBtn"
      );


    /* ========================================================
       OVERLAY
       ======================================================== */

    const overlay =
      document.getElementById(
        "scanModalOverlay"
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeScanDetailsModal
      );
    }


    if (closeFooterButton) {

      closeFooterButton.addEventListener(
        "click",
        closeScanDetailsModal
      );
    }


    if (overlay) {

      overlay.addEventListener(
        "click",
        closeScanDetailsModal
      );
    }
  }


  /* ============================================================
     8. CLOSE MODAL
     ============================================================ */

  function closeScanDetailsModal() {

    const modal =
      document.getElementById(
        "scanDetailsModal"
      );


    if (!modal) return;


    modal.classList.remove(
      "scan-modal--open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "modal-open"
    );
  }


  /* ============================================================
     ESCAPE KEY CLOSE MODAL
     ============================================================ */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeScanDetailsModal();
      }

    }
  );


  /* ============================================================
     9. DELETE SCAN
     ============================================================ */

  async function handleDeleteClick(
    deleteBtn
  ) {

    const confirmed =
      confirm(
        "Are you sure you want to delete this scan?"
      );


    if (!confirmed) return;


    const row =
      deleteBtn.closest(
        ".history-table__row"
      );


    if (!row) return;


    const scanId =
      row.dataset.id;


    if (!scanId) {

      showToast(
        "Scan ID not found.",
        "error"
      );

      return;
    }


    await deleteHistoryItem(
      scanId
    );
  }


  /* ============================================================
     DELETE HISTORY ITEM
     ============================================================ */

  async function deleteHistoryItem(
    scanId
  ) {

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/scan/${encodeURIComponent(
            scanId
          )}?userId=${encodeURIComponent(
            loggedInUserId
          )}`,
          {
            method: "DELETE"
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        showToast(
          data.message ||
          "Could not delete the scan.",
          "error"
        );

        return;
      }


      showToast(
        "Scan deleted successfully.",
        "success"
      );


      await loadHistory();

    } catch (error) {

      console.error(
        "Delete scan error:",
        error
      );


      showToast(
        "Could not connect to the server. Please make sure the backend is running.",
        "error"
      );
    }
  }


  /* ============================================================
     10. SEARCH HISTORY
     ============================================================ */

  function setupSearch() {

    if (
      !historySearch ||
      !historyTableBody
    ) {

      return;
    }


    historySearch.addEventListener(
      "input",
      function () {

        const searchTerm =
          historySearch.value
            .trim()
            .toLowerCase();


        filterRows(
          searchTerm
        );
      }
    );
  }


  function filterRows(
    searchTerm
  ) {

    if (!historyTableBody) return;


    const rows =
      historyTableBody.querySelectorAll(
        ".history-table__row"
      );


    let visibleRowCount =
      0;


    rows.forEach(
      function (row) {

        if (
          rowMatchesSearch(
            row,
            searchTerm
          )
        ) {

          row.style.display =
            "";

          visibleRowCount++;

        } else {

          row.style.display =
            "none";
        }

      }
    );


    toggleEmptyState(
      visibleRowCount === 0
    );
  }


  function rowMatchesSearch(
    row,
    searchTerm
  ) {

    if (
      searchTerm === ""
    ) {

      return true;
    }


    const urlCell =
      row.querySelector(
        ".history-table__cell--url"
      );


    const cells =
      row.querySelectorAll(
        ".history-table__cell"
      );


    const domainCell =
      cells[1];


    const urlText =
      urlCell
        ? urlCell.textContent
            .toLowerCase()
        : "";


    const domainText =
      domainCell
        ? domainCell.textContent
            .toLowerCase()
        : "";


    return (
      urlText.includes(
        searchTerm
      ) ||
      domainText.includes(
        searchTerm
      )
    );
  }


  /* ============================================================
     11. MOBILE NAVIGATION
     ============================================================ */

  function setupMobileNavbar() {

    if (
      !navToggle ||
      !navLinks
    ) {

      return;
    }


    navToggle.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();


        const isOpen =
          navLinks.classList.toggle(
            "open"
          );


        navToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );


        const icon =
          navToggle.querySelector(
            "i"
          );


        if (icon) {

          icon.className =
            isOpen
              ? "fa-solid fa-xmark"
              : "fa-solid fa-bars";
        }
      }
    );


    document.addEventListener(
      "click",
      function (event) {

        const clickedInsideMenu =
          navLinks.contains(
            event.target
          );


        const clickedToggle =
          navToggle.contains(
            event.target
          );


        if (
          !clickedInsideMenu &&
          !clickedToggle
        ) {

          navLinks.classList.remove(
            "open"
          );


          navToggle.setAttribute(
            "aria-expanded",
            "false"
          );


          const icon =
            navToggle.querySelector(
              "i"
            );


          if (icon) {

            icon.className =
              "fa-solid fa-bars";
          }
        }
      }
    );
  }


  /* ============================================================
     12. EMPTY STATE
     ============================================================ */

  function checkEmptyState() {

    if (!historyTableBody) return;


    const rows =
      historyTableBody.querySelectorAll(
        ".history-table__row"
      );


    const visibleRows =
      Array.from(rows)
        .filter(
          function (row) {

            return (
              row.style.display !==
              "none"
            );
          }
        );


    toggleEmptyState(
      visibleRows.length === 0
    );
  }


  function toggleEmptyState(
    shouldShow
  ) {

    if (!emptyState) return;


    if (shouldShow) {

      emptyState.classList.remove(
        "history-empty-state--hidden"
      );


      if (historyTableWrapper) {

        historyTableWrapper.style.display =
          "none";
      }

    } else {

      emptyState.classList.add(
        "history-empty-state--hidden"
      );


      if (historyTableWrapper) {

        historyTableWrapper.style.display =
          "";
      }
    }
  }


  /* ============================================================
     13. TOAST NOTIFICATIONS
     ============================================================ */

  function showToast(
    message,
    type = "success"
  ) {

    let toast =
      document.getElementById(
        "scanToast"
      );


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "scanToast";

      toast.setAttribute(
        "role",
        "status"
      );

      document.body.appendChild(
        toast
      );
    }


    const icon =
      type === "error"
        ? "fa-circle-exclamation"
        : "fa-circle-check";


    toast.className =
      `scan-toast scan-toast--${type}`;


    toast.innerHTML = `

      <i
        class="fa-solid ${icon}"
        aria-hidden="true"
      ></i>

      <span>
        ${escapeHtml(message)}
      </span>

    `;


    requestAnimationFrame(
      function () {

        toast.classList.add(
          "scan-toast--show"
        );
      }
    );


    clearTimeout(
      toast.hideTimeout
    );


    toast.hideTimeout =
      setTimeout(
        function () {

          toast.classList.remove(
            "scan-toast--show"
          );

        },
        3000
      );
  }


  /* ============================================================
     14. LOADING SPINNER
     ============================================================ */

  function showLoadingSpinner() {

    let spinner =
      document.getElementById(
        "scanLoadingSpinner"
      );


    if (!spinner) {

      spinner =
        document.createElement(
          "div"
        );

      spinner.id =
        "scanLoadingSpinner";

      spinner.className =
        "scan-loading-spinner";


      spinner.innerHTML = `

        <div
          class="scan-loading-spinner__box"
        >

          <div
            class="scan-loading-spinner__circle"
          ></div>

          <p>
            Loading scan details...
          </p>

        </div>

      `;


      document.body.appendChild(
        spinner
      );
    }


    spinner.classList.add(
      "scan-loading-spinner--show"
    );
  }


  function hideLoadingSpinner() {

    const spinner =
      document.getElementById(
        "scanLoadingSpinner"
      );


    if (!spinner) return;


    spinner.classList.remove(
      "scan-loading-spinner--show"
    );
  }


  /* ============================================================
     15. START PAGE FEATURES
     ============================================================ */

  updateNavbarForLogin();

  loadHistory();

  setupMobileNavbar();

  setupSearch();

  setupRowActions();

});
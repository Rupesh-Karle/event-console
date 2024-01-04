//const apiBaseUrl = `http://ec2-54-176-236-201.us-west-1.compute.amazonaws.com/api/`;
//const webBaseUrl = `http://ec2-54-176-236-201.us-west-1.compute.amazonaws.com/`;

// const apiBaseUrl = `https://streamonhub.com/api/`;
// const webBaseUrl = `https://streamonhub.com/`;
const apiBaseUrl = `http://localhost:8005/api/`;
const webBaseUrl = `http://localhost:8005/`;

const publicUrls = ["index", "login", "register", "error", "site"];

function storeJwtToken(token) {
  localStorage.setItem("authToken", token);
}

function getJwtToken() {
  return localStorage.getItem("authToken");
}

function storeRefreshToken() {}

function storeUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function storeNavbar(navbarJson) {
  localStorage.setItem("navbar", JSON.stringify(navbarJson));
}

function getNavbar() {
  return JSON.parse(localStorage.getItem("navbar"));
}

function storeExpiryTimestamp(timestamp) {
  try {
    localStorage.setItem("expiry", timestamp.toString());
  } catch (error) {
    console.log("TypeError ->", error);
    window.location.href = `${webBaseUrl}logout`;
  }
}

function getExpiryTimestamp() {
  return localStorage.getItem("expiry");
}

function authTokenExpirycoundown() {
  let isCounterModalOpen = false;
  let expiryDateTime = getExpiryTimestamp();
  if (expiryDateTime) {
    setInterval(function () {
      let expiryDateTime = getExpiryTimestamp();
      let endDateTime = new Date(expiryDateTime);
      let remaining = endDateTime - new Date();

      if (remaining >= 0) {
        if (remaining <= 30000 && isCounterModalOpen == false) {
          isCounterModalOpen = true;
          let timerInterval = remaining;
          Swal.fire({
            title: "You are going to logout!",
            html: "You are logout out in <b></b> seconds.",
            showCancelButton: true,
            cancelButtonText: "Stay tuned",
            showDenyButton: true,
            denyButtonText: `Logout now`,
            timer: timerInterval,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const b = Swal.getHtmlContainer().querySelector("b");
              timerInterval = setInterval(() => {
                b.textContent = Math.floor(Swal.getTimerLeft() / 1000);
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
              console.log("refresh token");
              refreshToken();
            },
          }).then((result) => {
            console.log({ result });
            //return false;
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
              console.log("I was closed by the timer");
              window.location.href = `${webBaseUrl}logout`;
            } else if (result.isDenied) {
              console.log("refresh isDenied");
            } else {
              console.log("refresh else");
            }
          });
        }
        //console.log(remaining);
      } else {
        storeExpiryTimestamp(null);
      }
    }, 1000);
  }
}

function storeAlert(alertObj) {
  localStorage.setItem("alert", JSON.stringify(alertObj));
}

function getAlert() {
  return JSON.parse(localStorage.getItem("alert"));
}

function showGlobalAlert() {
  let globalAlert = getAlert();
  if (globalAlert.code) {
    showAlertMessage(globalAlert);
  }
}

const customAlert = (alertDiv, type, message) => {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertDiv.html(wrapper);

  $(alertDiv)
    .fadeTo(2000, 500)
    .slideUp(500, function () {
      $(alertDiv).slideUp(500);
    });
};

function handleError(e) {
  // your common error handling
}

function handleResult(result) {
  // your common result handling
}

function handleBeforeSend() {
  // your common  handling
}

function getPage() {
  try {
    const segments = document.location.pathname.split("/");
    //const last = segments.pop() || segments.pop(); // Handle potential trailing slash
    if (segments.length >= 2) {
      return segments[1];
    } else {
      return segments[0];
    }
  } catch (error) {
    //Uups, href wasn't a valid URL (empty string or malformed URL)
    console.log("TypeError ->", error);
    return null;
  }
}

function showAlertMessage(alertObj) {
  if (alertObj.code) {
    let alert = $("#alert");
    alert.find("#alert-content").html(alertObj.content);
    alert.removeClass("d-none");
    alert.addClass(alertObj.code + " show");
  }
}

function hideAlertMessage() {
  $("#alert").addClass("d-none");
}

function setPageMeta(page) {
  $("meta[name=page]").attr("content", page);
}

function getPageMeta() {
  return $("meta[name=page]").attr("content");
}

function checkPageAccess() {
  let companyId = $("meta[name=id]").attr("content");
  companyId = hasData(companyId) ? companyId : null;
  let page = getPageMeta();

  if (page) {
    let url = `${apiBaseUrl}page-access`;

    $.ajax({
      url: url,
      type: "POST",
      data: { page: page, companyId: companyId },
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + getJwtToken());
      },
      success: function (data, textStatus, jqXHR) {
        //data - response from server
        console.log({ data });

        if (data.status == "success") {
          //console.log(data.data.actions);

          let responseData = data.data;

          if (responseData.is_verified_user == false) {
            let alertDiv = $(".alert-section");
            customAlert(
              alertDiv,
              responseData.alert.type,
              responseData.alert.message
            );
          }
          pageVisibility(responseData.page.hide, "hide");
          pageVisibility(responseData.page.show, "show");

          if (typeof hideClasses !== undefined) {
            hideClasses = responseData.page.hide;
          }

          if (typeof showClasses !== undefined) {
            showClasses = responseData.page.show;
          }

          console.log("ok...");
        } else {
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {},
    });
  }
}

function pageVisibility(classes, action) {
  if (action == "hide") {
    classes.forEach(function (item) {
      $("." + item).addClass("d-none");
    });
  } else if (action == "show") {
    classes.forEach(function (item) {
      $("." + item).removeClass("d-none");
    });
  }
}

function generateNavbar(navbarObject) {
  let page = window.location.pathname.replace(/^\/([^\/]*).*$/, "$1");

  let content = ``;
  $.each(navbarObject, function (index, navbar) {
    content += `<li class="${page == navbar.url ? "menuitem-active" : ""}">
      <a href="${webBaseUrl}${navbar.url}" class="${
      page == navbar.url ? "active" : ""
    }" >
          <i class="fa fa-${navbar.icon}" aria-hidden="true"></i>
          <span> ${navbar.label} </span>
      </a>
    </li>`;
  });
  return content;
}

function refreshToken() {
  $.ajax({
    url: `${apiBaseUrl}account/refresh-token`,
    type: "POST",
    data: {},
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + getJwtToken());
    },
    success: function (data, textStatus, jqXHR) {
      //data - response from server
      console.log({ data });

      if (data.status == "success") {
        //console.log(data.data.actions);

        let responseData = data.data;

        storeJwtToken(responseData.token);
        storeExpiryTimestamp(responseData.expiry);
      } else {
        window.location.href = `${webBaseUrl}logout`;
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
}

function fetchMenu(formData) {
  let url = `${apiBaseUrl}get-navbar`;

  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + getJwtToken());
    },
    success: function (data, textStatus, jqXHR) {
      //data - response from server
      if (data.status == "success") {
        let menuList = data.data.navbar;
        let navbarContent = ``;
        if (menuList) {
          navbarContent = generateNavbar(menuList);
          $("#side-menu").html(`<li class="menu-title">Navigation</li>`);
          $("#side-menu").append(navbarContent);
        }
        storeNavbar(menuList);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
}

function snackCase(str) {
  return str
    .replace(/[^a-zA-Z0-9 \b]/g, "")
    .toLowerCase()
    .split(" ")
    .join("_");
}

function addObjectToArrayIfNotExists(arr, obj) {
  const index = arr.findIndex(
    (item) => JSON.stringify(item) === JSON.stringify(obj)
  );
  if (index === -1) {
    arr.push(obj);
  }

  console.log({ arr });
}

function validateCountyName(countyName) {
  // Define a regular expression pattern that matches county names
  const pattern = /^[A-Za-z\s]+$/;

  // Use the test() method of the regular expression object to check if the input matches the pattern
  if (pattern.test(countyName)) {
    // The input is valid
    return true;
  } else {
    // The input is invalid
    return false;
  }
}

function normalizeString(str) {
  // Replace all consecutive white spaces with a single space
  str = str.replace(/\s+/g, " ");

  // Remove leading and trailing spaces
  str = str.trim();

  // Return the normalized string
  return str;
}

async function getClientInfo() {
  try {
    // setTimeout(() => {
    //   loader("hide");
    // }, 1000);
    return true;
    let clientInfo = {};
    let ipInfo = await $.getJSON(
      "https://api.ipify.org?format=jsonp&callback=?",
      function (data) {
        return data;
      }
    );
    if (hasData(ipInfo.ip)) {
      clientInfo.ip = ipInfo.ip;
    }
    // browser name
    var nAgt = navigator.userAgent,
      browserName = "";
    let verOffset;
    if ((verOffset = nAgt.indexOf("OPR")) != -1) {
      browserName = "Opera";
    }
    // In MS Edge, the true version is after "Edg" in userAgent
    else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
      browserName = "Microsoft Edge";
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
      browserName = "Microsoft Internet Explorer";
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
      browserName = "Chrome";
    }
    // In Safari, the true version is after "Safari" or after "Version"
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
      browserName = "Safari";
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
      browserName = "Firefox";
    }
    // In most other browsers, "name/version" is at the end of userAgent
    else if (
      (nameOffset = nAgt.lastIndexOf(" ") + 1) <
      (verOffset = nAgt.lastIndexOf("/"))
    ) {
      browserName = nAgt.substring(nameOffset, verOffset);
      if (browserName.toLowerCase() == browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    clientInfo.browserName = browserName;

    clientInfo.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return clientInfo;
  } catch (error) {
    return { error };
  }
}

document.addEventListener("DOMContentLoaded", function () {
  getClientInfo().then((data) => {
    console.log("finished loading");
    setTimeout(() => {
      // loader("hide");
    }, 2000);
  });
});

// event related functions

function storeEventUserJwtToken(token) {
  localStorage.setItem("authToken", token);
}

function getEventUserJwtToken() {
  return localStorage.getItem("authToken");
}

function storeEventUser(user) {
  localStorage.setItem("eventUser", JSON.stringify(user));
}

function getEventUser() {
  return JSON.parse(localStorage.getItem("eventUser"));
}

function checkUserActivity() {
  let intervalFunction = setInterval(function() {
    let expirationTime = new Date(getExpiryTimestamp()).getTime();
    let currentTime = new Date().getTime();
    if ((!isNaN(expirationTime)) && Math.ceil((expirationTime - currentTime) / (60 * 1000)) <= 2) {
      function handleUserActivity() {
        $(document).off("mousemove keydown click", handleUserActivity);
        refreshToken();
      }
      
      $(document).on("mousemove keydown click", handleUserActivity);
    }
  }, 1000)
}
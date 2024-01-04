// storeJwtToken(data.data.token);
var apiBaseUrl = `${domainName}/api/`;

function login(formData) {
  //let url = window.location.href.split("?")[0];
  let url = `${apiBaseUrl}${companySlug}/event/${eventSlug}/login`;

  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    success: function (data, textStatus, jqXHR) {
      console.log({ data });
      //data - response from server
      if (data.status == "success") {
        let token = data?.data?.token;
        let expiry = data?.data?.expiry;
        localStorage.token = token;
        localStorage.expiry = expiry;
        localStorage.userId = data?.data?.user?.id;
        let url = "";
        if (data.data?.url) {
          if (!/^https:\/\//i.test(data.data.url)) {
            // Add 'https://' protocol
            url = "https://" + data.data.url;
          } else {
            url = data.data.url;
          }
        }
        window.open(url, "_blank");
      } else {
        Swal.fire({
          title: "Access Denied",
          text: "Your request for access has been denied.",
          icon: "info",
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
}

function registerUser(formData) {
  formData.push({ name: "country", value: countryName });
  //let url = window.location.href.split("?")[0];
  let url = `${apiBaseUrl}${companySlug}/event/${eventSlug}/register`;

  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    success: function (data, textStatus, jqXHR) {
      console.log({ data });
      //data - response from server
      if (data.status == "success") {
        let url = data.data.url;

        // if (url) {
        //   window.open(url, "_blank");
        // } else {
        //   //window.location.reload();
        // }

        Swal.fire({
          title: "Register Success",
          text: "You registered successfully.",
          icon: "success",
        }).then((result) => {
          if (url) {
            window.open(url, "_blank");
          } else {
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: "Already registered",
          text: "You are already registered",
          icon: "warning",
        }).then((result) => {
          window.location.reload();
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      Swal.fire({
        title: "Already registered",
        text: "You are already registered",
        icon: "warning",
      }).then((result) => {
        window.location.reload();
      });
      // window.location.reload();
    },
  });
}

function increaseVisitCounter() {
  let url = `${apiBaseUrl}${companySlug}/event/${eventSlug}/increase-event-visit`;

  $.ajax({
    url: url,
    type: "POST",
    data: {},
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
    },
  });
}

function getCountryName() {
  //get timeZone of the brower
  try {
    let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneDetails = ct.getTimezone(browserTimeZone);
    let countryCode = timezoneDetails.countries[0];

    //get Country name
    const countryDetails = ct.getCountry(countryCode);
    return countryDetails.name;
  } catch (error) {
    return null;
  }
}

//global source
let searchParam = new URLSearchParams(window.location.search);
let source = searchParam.get("source") ?? "direct";
var countryName = getCountryName();

$(document).ready(function () {
  console.log("ready!");
  // Example starter JavaScript for disabling form submissions if there are invalid fields
  increaseVisitCounter();
  (function () {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener(
        "submit",
        function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }

          form.classList.add("was-validated");
        },
        false
      );
    });
  })();

  if (source) {
    $("form#registerForm").append(
      `<input type="hidden" name="source" id="source" value="${source}"/>`
    );
  }

  $(document).on("submit", "form#loginForm", function (e) {
    e.preventDefault();
    console.log("submit");
    login($(this).serializeArray());
  });

  $(document).on("submit", "form#registerForm", function (e) {
    e.preventDefault();
    registerUser($(this).serializeArray());
  });
});
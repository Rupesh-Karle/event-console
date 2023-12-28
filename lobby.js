function generateUniqueString(prefix) {
  const timestamp = new Date().getTime();
  const randomValue = Math.floor(Math.random() * 1000); // Adjust the range as needed
  const uniqueString = `${prefix}_${timestamp}_${randomValue}`;
  return uniqueString;
}

function updateActiveTabColor(globalActiveTabColor = "#FFFFFF") {
  // Find the element with class 'sessiontab' and 'active'
  var activeTab = $(".sessiontab.active");
  $(".nav-link").css("background", "");
  activeTab.css("background", globalActiveTabColor);
  activeTab.css("color", "#FFFFFF");
}

function setPageColorProperties(colorProperties) {
  if (colorProperties) {
    $.each(colorProperties, function (key, value) {
      console.log(key + ": " + value);
      if (key == "primaryColor") {
        $(".primaryColorInput").val(value);
        $(".bluesec").css("background-color", value);
      } else if (key == "secondaryColor") {
        $(".modrator").css("background-color", value);
        $(".secondaryColorInput").val(value);
        globalActiveTabColor = value;
        updateActiveTabColor(value);
        // $(".show-more").css("color", value);
      } else if (key == "bgColor") {
        $(".bgColorInput").val(value);
        $(".viewerbg").css("background-color", value);
      } else if (key == "hoverColor") {
        $(".hoverColorInput").val(value);
      } else if (key == "textColor") {
        $(".textColorInput").val(value);
        $(
          ".userinfo, .userdec strong, .userdec span, .importat, .sessiontab, .modrator, .usertest a span, .resoursefile a, .bluesec"
        ).css("color", textColor);
        console.log({ textColor });
        $("p").css("color", textColor);
        $(".svg-icons path").css("fill", textColor);

        $("<style>")
          .prop("type", "text/css")
          .html(`.modrator::placeholder { color: ${textColor} !important; }`)
          .appendTo("head");
      } else if (key == "iconColor") {
        $(".iconColorInput").val(value);
      }
    });
  }
}

function setPageImages(imageUrl) {
  if(imageUrl) {
    $(".logo-img").removeClass("d-none");
    $(".logo-img")[0].src = imageUrl;
  } else {
    $(".logo-img").addClass("d-none");
  }
}


function speakerItemRender(itemCount, itemSlug, item = {}) {
  let {profile_pic_url, description, name, order} = item;
  return `
    <li>
      <div class="teming"><img
              src="${profile_pic_url}"
              alt=""></div>
      <div class="infowrap">
          <div class="teamname">${name}</div>
          <div class="teamdec show-more-height">${description}</div>
          <div class="show-more">More...</div>
      </div>
    </li>
  `;
}

function handleSessionDetails(
  session_title,
  session_description,
  session_sub_title,
  sessionSpeakers
) {
  $(".session-title").text(session_title);
  $("#session-description").text(session_description);
  $("#session-subtitle").text(session_sub_title);
  if (sessionSpeakers) {
    console.log({ sessionSpeakers });
    var numberOfChildren = $(".facultywrap.wrapfac").children().length;
    Object.entries(sessionSpeakers).forEach(([slug, value]) => {
      console.log(`Key: ${slug}, Value:`, value);
      numberOfChildren++;
      let newSessionItem = speakerItemRender(numberOfChildren, slug, value);
      $(".facultywrap.wrapfac").append(newSessionItem);
    });
  }
}

function readPageJson() {
  // Use jQuery's getJSON function to read the JSON file
  $.getJSON(
    pageDetailJsonUrl + "?id=" + generateUniqueString("time_"),
    function (data) {
      // Data is the parsed JSON object
      console.log({ data });
      setPageColorProperties(data?.colorProperties);
      setPageImages(data?.logoImageUrl);
      $(".facultywrap.wrapfac").html("");
      handleSessionDetails(
        data?.session_title,
        data?.session_description,
        data?.session_sub_title,
        data?.sessionSpeakers
      );

      $(".loader-section").removeClass("d-flex");
      $(".loader-section").css("display", "none");
      $("header.mainheader").removeClass("d-none");
      $(".container-fluid").removeClass("d-none");

      // Now you can work with the data as needed
      // For example, you can iterate over it and display values
      $.each(data, function (key, value) {
        console.log(key + ": " + value);
      });
      // handlePollDetails(data?.pollQuestions, data?.pollOptions);
    }
  ).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.error("Request Failed: " + err);
  });
}


function startQueWebSocket() {
  queWebSocketUrl =
    "wss://cmu8ginphj.execute-api.us-east-1.amazonaws.com/production?event_id=108&room=question";
  queWebSocket = new WebSocket(queWebSocketUrl);

  queWebSocket.onopen = function (event) {
    console.log("Connected to WebSocket");
    console.log({ event });
    // displayMessage("Connected to WebSocket");
  };

  queWebSocket.onmessage = function (event) {
    console.log("Message from server:", event.data, event);
    displayMessage(event.data, room.question);
  };

  queWebSocket.onerror = function (event) {
    console.error("WebSocket error:", event);
    // displayMessage("WebSocket Error: " + event);
  };

  queWebSocket.onclose = function (event) {
    console.log("WebSocket connection closed:", event);
    // displayMessage("WebSocket Connection Closed");
  };

  document.getElementById("send").onclick = function () {
    let message = document.getElementById("message").value;
    let messageObj = {
      action: "sendmessage",
      message: message,
      event_id: "108",
      room: "question",
      name: "Test User",
    };
    let messageJson = JSON.stringify(messageObj);
    queWebSocket.send(messageJson);
    if (message != null && message != "") {
      $("#question-box").prepend(`
                <tr>
                    <td>${messageObj.name}</td>
                    <td>${messageObj.message}</td>
                    <td>-</td>
                </tr>
            `);
    }
    document.getElementById("message").value = "";
  };
}

function startChatWebSocket() {
  webSocketChatUrl =
    "wss://cmu8ginphj.execute-api.us-east-1.amazonaws.com/production?event_id=108&room=chat";
  chatWebSocket = new WebSocket(webSocketChatUrl);

  chatWebSocket.onopen = function (event) {
    console.log("Connected to ChatWebSocket");
    console.log({
      event,
    });
  };

  chatWebSocket.onmessage = function (event) {
    console.log("Message from server:", event.data, event);
    displayMessage(event.data, room.chat);
  };

  chatWebSocket.onerror = function (event) {
    console.error("WebSocket error:", event);
    // displayMessage("WebSocket Error: " + event);
  };

  chatWebSocket.onclose = function (event) {
    console.log("WebSocket connection closed:", event);
    // displayMessage("WebSocket Connection Closed");
  };

  document.getElementById("btnSendChatMessage").onclick = function () {
    let message = document.getElementById("sendChatMessage").value;
    let messageObj = {
      action: "sendmessage",
      message: message,
      event_id: "108",
      room: "chat",
      name: "Test User",
    };
    let messageJson = JSON.stringify(messageObj);
    chatWebSocket.send(messageJson);
    if (message != null && message != "") {
      $("#chatBody").append(`
                <div class="message user-message">
                    <div class="d-flex mb-1">
                        <span class="text-nowrap text-truncate mr-2">
                            ${messageObj.name}
                        </span>
                        <span class="text-nowrap text-truncate ml-auto">
                            ${getCurTime()}
                        </span>
                    </div>
                    <div>${messageObj.message}</div>
                </div>
            `);
    }
    document.getElementById("sendChatMessage").value = "";
  };
}

function startPollWebSocket() {
  webSocketPollUrl =
    "wss://cmu8ginphj.execute-api.us-east-1.amazonaws.com/production?event_id=108&room=poll";
  pollWebSocket = new WebSocket(webSocketPollUrl);

  pollWebSocket.onopen = function (event) {
    console.log("Connected to pollWebSocket");
    console.log({ event });
    // displayMessage("Connected to WebSocket");
  };

  pollWebSocket.onmessage = function (event) {
    console.log("Message from server:", event.data, event);
    displayMessage(event.data, room.chat);
  };

  pollWebSocket.onerror = function (event) {
    console.error("WebSocket error:", event);
    // displayMessage("WebSocket Error: " + event);
  };

  pollWebSocket.onclose = function (event) {
    console.log("WebSocket connection closed:", event);
    // displayMessage("WebSocket Connection Closed");
  };
}

function getCurTime() {
  let date = new Date();
  let hour = date.getHours();
  return (
    ("0" + (hour % 12)).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2) +
    (hour >= 12 ? " PM" : " AM")
  );
}

function displayMessage(data, roomType) {
  try {
    data = JSON.parse(data);
    if (!data || !Object.keys(data).length) {
      return;
    }
  } catch (err) {
    data = data;
  }
  let { name, action, roomName, message, event_id } = data;
  // const chatBox = document.getElementById('chat-box');
  let messageContent = "";
  switch (roomType) {
    case room.question:
      messageContent += `
                <tr>
                    <td>${name}</td>
                    <td>${message}</td>
                    <td>-</td>
                </tr>
            `;
      $("#question-box").prepend(messageContent);
      break;
    case room.chat:
      messageContent += `
                <div class="message other-message">
                    <div class="d-flex mb-1">
                        <span class="text-nowrap text-truncate mr-2">
                            ${name}
                        </span>
                        <span class="text-nowrap text-truncate ml-auto">
                            ${getCurTime()}
                        </span>
                    </div>
                    <div>${message}</div>
                </div>
            `;
      $("#chatBody").append(messageContent);
      break;
    default:
      break;
  }
}

async function IVSPlayerInit(IVSPlayerPackage) {
  let playbackState = "playing";
  // First, check if the browser supports the IVS player.
  if (!IVSPlayerPackage.isPlayerSupported) {
    console.warn("The current browser does not support the IVS player.");
    return;
  }

  const PlayerState = IVSPlayerPackage.PlayerState;
  const PlayerEventType = IVSPlayerPackage.PlayerEventType;

  // Initialize player
  let player = IVSPlayerPackage.create({
    name: "player",
    width: "100%",
    height: "100%",
    muted: true,
    autoplay: true,
  });
  console.log("IVS Player version:", player.getVersion());
  player.attachHTMLVideoElement(document.getElementById("video-player"));

  // Attach event listeners
  player.addEventListener(PlayerState.PLAYING, function () {
    console.log("Player State - PLAYING");
    console.log("Latency: " + player.getLiveLatency());
  });
  player.addEventListener(PlayerState.ENDED, function () {
    console.log("Player State - ENDED");
  });
  player.addEventListener(PlayerState.READY, function () {
    console.log("Player State - READY");
  });
  player.addEventListener(PlayerEventType.ERROR, function (err) {
    console.warn("Player Event - ERROR:", err);
  });
  player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
    let metadataText = cue.text;
    try {
      if (typeof metadataText === "string") {
        metadataText = makeJSObject(metadataText);
        if (typeof metadataText === "string") {
          metadataText = makeJSObject(metadataText);
          if (typeof metadataText === "string") {
            metadataText = makeJSObject(metadataText);
          }
        }
      }
      // displayLivePoll(metadataText);
    } catch (error) {
      console.error(`Error parsing JSON:`, error);
    }
  });

  player.addEventListener(PlayerState.BUFFERING, function () {
    console.log("Player State - BUFFERING");
  });

  player.addEventListener(PlayerEventType.REBUFFERING, function () {
    console.log("Player State - RE-BUFFERING");
    // rebuffered = true;
  });

  await getStreamingConfig(companyId, eventId);
  console.log("BEFORE SET", {
    playbackUrl,
  });
  player.load(playbackUrl);
  player.setVolume(0.5);

  player.on("pause", () => {
    playbackState = "paused";
  });

  player.on("resume", () => {
    playbackState = "playing";
  });
}

function refreshPage(contentOnly = false) {
  if(contentOnly) {
    readPageJson();
  } else {
    readPageJson();
    startQueWebSocket();
    startPollWebSocket();
    startChatWebSocket();
    (function(IVSPlayerPackage) {
      IVSPlayerInit(IVSPlayerPackage)
    });
  }
}


//Global Variables
var queWebSocketUrl = webSocketPollUrl = webSocketChatUrl = null;
var queWebSocket = pollWebSocket = chatWebSocket = null;

$(document).ready(async function() {
  if(!getJwtToken()) {
    window.location.href("/");
  }
  refreshPage();
  
  $("ul.facultywrap.wrapfac").on("click", ".show-more", function () {
    if ($(this).parent().find(".teamdec").hasClass("show-more-height")) {
        $(this).text("Less...");
    } else {
        $(this).text("More...");
    }
    $(this).parent().find(".teamdec").toggleClass("show-more-height");
  });

  $(document).on("click", ".btn-refresh", function(e) {
    e.preventDefault();
    refreshPage(true);
  })
});
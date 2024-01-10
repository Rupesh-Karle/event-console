function generateUniqueString(prefix) {
  const timestamp = new Date().getTime();
  const randomValue = Math.floor(Math.random() * 1000); // Adjust the range as needed
  const uniqueString = `${prefix}_${timestamp}_${randomValue}`;
  return uniqueString;
}

function updateActiveTabColor(globalActiveTabColor = "#FFFFFF") {
  console.log({globalActiveTabColor})
  // Find the element with class 'sessiontab' and 'active'
  $(".nav-link").css("background", "");
  var activeTab = $(".sessiontab.active");
  // activeTab.css("background", "");
  activeTab.css("background", (globalActiveTabColor + " !important"));
  activeTab.css("color", "#FFFFFF");
}

function setPageColorProperties(colorProperties) {
  if (colorProperties) {
    $.each(colorProperties, function(key, value) {
      if (key == "primaryColor") {
        $(".primaryColorInput").val(value);
        $(".bluesec").css("background-color", value);
      } else if (key == "secondaryColor") {
        $(".modrator").css("background-color", value);
        $(".secondaryColorInput").val(value);
        globalActiveTabColor = value;
        updateActiveTabColor(value);
        console.log("inside secondary color")
        // $(".show-more").css("color", value);
      } else if (key == "bgColor") {
        $(".bgColorInput").val(value);
        $(".viewerbg").css("background-color", value);
      } else if (key == "hoverColor") {
        $(".hoverColorInput").val(value);
        $("<style>")
            .prop("type", "text/css")
            .html(
                `a:hover, button:hover { color: ${value} !important; }`
            )
            .appendTo("head");
      } else if (key == "textColor") {
        textColor = value;
        $(".textColorInput").val(value);
        $(
          ".userinfo, .userdec strong, .userdec span, .importat, .sessiontab, .modrator, .usertest a span, .resoursefile a, .bluesec"
        ).css("color", textColor);
        console.log({ textColor });
        $("p").css("color", textColor);
        $(".svg-icons path").css("fill", textColor);

        $("<style>")
          .prop("type", "text/css")
          .html(`.modrator::placeholder { color: ${textColor} !important; } #polls-container p { color: ${textColor} !important; }`)
          .appendTo("head");
      } else if (key == "iconColor") {
        console.log({key: value});
        $(".btn-drawer").css("color", value);
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

async function readPageJson() {
  // Use jQuery's getJSON function to read the JSON file
  await $.getJSON(
    pageDetailJsonUrl + "?id=" + generateUniqueString("time_"),
    function (data) {
      // Data is the parsed JSON object
      // data = data
      console.log({data});
      setPageColorProperties(data?.colorProperties);
      setPageImages(data?.logoImageUrl);
      $(".facultywrap.wrapfac").html("");
      handleSessionDetails(
        data?.session_title,
        data?.session_description,
        data?.session_sub_title,
        data?.sessionSpeakers
      );

      pollQuestions = data?.pollQuestions;
      pollOptions = data?.pollOptions;
      
      surveyQuestions = data?.surveyQuestions;

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

  await $.getJSON(
    playerConfigUrl + "?id=" + generateUniqueString("time_"),
    function (data) {
      // Data is the parsed JSON object
      console.log({ data });
      if (data && Object.keys(data).length) {
        let ingestEndpoint =
          "rtmps://" + data.channel.ingestEndpoint + ":443/app/";
        // $("#ingest-endpoint").val(ingestEndpoint);
        // $("#stream-key").val(data.streamKey.value);
        playbackUrl = data.channel.playbackUrl;
        console.log({
          playbackUrl,
        });
      }
    }
  ).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.error("Request Failed: " + err);
  });
  return true;
}


function startQueWebSocket() {
  queWebSocketUrl =
    "wss://cmu8ginphj.execute-api.us-east-1.amazonaws.com/production?event_id=" + eventId + "&room=question";
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
      event_id: eventId,
      user_id: userId,
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
    "wss://cmu8ginphj.execute-api.us-east-1.amazonaws.com/production?event_id=" + eventId + "&room=chat";
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
      event_id: eventId,
      user_id: userId,
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
    "wss://cmu8ginphj.execute-api.us-east-1.amazonaws.com/production?event_id=" + eventId + "&room=poll";
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


async function getStreamingConfig(companyId, eventId) {
  return await $.ajax({
    url: `${apiBaseUrl}company/${companyId}/${eventId}/get-streaming-config`, // Update with your Laravel route
    type: "GET",
    // data: JSON.stringify(formData),
    contentType: false,
    processData: false,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + getJwtToken());
    },
    success: function (data) {
      if (data?.status == "success") {
        let config = data?.data?.config;
        let polls = data?.data?.polls;
        // let surveys = data?.data?.surveys;

        // if (surveys && Object.keys(surveys).length) {
        //   eventSurveys = surveys;
        //   renderSurveysQuestion(surveys);
        // }

        if (config && Object.keys(config).length) {
          let ingestEndpoint =
            "rtmps://" + config.channel.ingestEndpoint + ":443/app/";
          $("#ingest-endpoint").val(ingestEndpoint);
          $("#stream-key").val(config.streamKey.value);
          playbackUrl = config.channel.playbackUrl;
          console.log({
            playbackUrl,
          });
        }
        console.log("data from streaming api: " + config);
      }
    },
    error: function (error) {
      console.error(error);
    },
  });
}

async function IVSPlayerInit(IVSPlayerPackage) {
  console.log("IVSPlayerInit called");
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
      displayLivePoll(metadataText);
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


function makeJSObject(string) {
  try {
    return JSON.parse(string);
  } catch {
    return string;
  }
}

async function refreshPage(contentOnly = false) {
  if(contentOnly) {
    await readPageJson();
  } else {
    await readPageJson();
    startQueWebSocket();
    startPollWebSocket();
    startChatWebSocket();
    (async function (IVSPlayer) {
      console.log("IVSPlayer: ", {IVSPlayer});
      const PlayerState = IVSPlayer.PlayerState;
      const PlayerEventType = IVSPlayer.PlayerEventType;
    
      // Initialize player
      player = IVSPlayer.create();
      player.attachHTMLVideoElement(videoPlayer);
    
      // Attach event listeners
      player.addEventListener(PlayerState.PLAYING, function () {
        console.log("Player State - PLAYING");
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
    
      player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, function (cue) {
        var metadataText = cue.text.trim();
        const position = player.getPosition().toFixed(2);
        console.log(
          `PlayerEvent - METADATA: "${metadataText}". Observed ${position}s after playback started.`
        );
        try {
          if (typeof metadataText === "string") {
            metadataText = makeJSObject(JSON.stringify(metadataText));
            if (typeof metadataText === "string") {
              console.log(metadataText);
              metadataText = makeJSObject(metadataText);
              if (typeof metadataText === "string") {
                metadataText = makeJSObject(metadataText);
              }
            }
          }
        } catch (error) {
          console.error(`Error parsing JSON:`, error);
        }
        let {type, action, data} = metadataText;

        if(type && action) {
          switch(type) {
            case "poll":
              if(action == "show") {
                $("ul#myTab > li > .nav-link").removeClass("active");
                $("#myTabContent > .tab-pane").removeClass("active");
                $("ul#myTab > li > .nav-link#pollstab").addClass("active");
                $("#myTabContent > .tab-pane#polls").addClass("active show");
                if(data) {
                  displayLivePoll(data?.poll_id);
                }
              } else if(action == "stop") {
                $("#polls-container").html(`<p class="text-center">Waiting for poll question.</p>`);
              }
              break;
            case "survey":
              if(action == "show") {
                $("ul#myTab > li > .nav-link").removeClass("active");
                $("#myTabContent > .tab-pane").removeClass("active");
                $("ul#myTab > li > .nav-link#survey").addClass("active");
                $("#myTabContent > .tab-pane#surveytab").addClass("active show");
                if(data && data?.survey_id) {
                  displayLiveSurvey(data?.survey_id);
                }
              } else if(action == "stop") {
                $("#surveys-container").html(`<p class="text-center">Waiting for survey question.</p>`);
              }
              break;
            default:
              console.log("No such type.")
              break;
          }
        }
      });
    
      // Setup stream and play
      
      player.setAutoplay(true);
      player.load(playbackUrl);
    
      // Setvolume
      player.setVolume(0.1);
    
      // Remove card
      // function removeCard() {
      //   quizEl.classList.toggle("drop");
      // }
    
      // Trigger quiz
      // function triggerQuiz(metadataText) {
      //   let obj = JSON.parse(metadataText);
    
      //   quizEl.style.display = "";
      //   quizEl.classList.remove("drop");
      //   waitMessage.style.display = "none";
      //   cardInnerEl.style.display = "none";
      //   cardInnerEl.style.pointerEvents = "auto";
    
      //   while (answersEl.firstChild) answersEl.removeChild(answersEl.firstChild);
      //   questionEl.textContent = obj.question;
    
      //   let createAnswers = function (obj, i) {
      //     let q = document.createElement("a");
      //     let qText = document.createTextNode(obj.answers[i]);
      //     answersEl.appendChild(q);
      //     q.classList.add("answer");
      //     q.appendChild(qText);
    
      //     q.addEventListener("click", (event) => {
      //       cardInnerEl.style.pointerEvents = "none";
      //       if (q.textContent === obj.answers[obj.correctIndex]) {
      //         q.classList.toggle("correct");
      //       } else {
      //         q.classList.toggle("wrong");
      //       }
      //       setTimeout(function () {
      //         removeCard();
      //         waitMessage.style.display = "";
      //       }, 1050);
      //       return false;
      //     });
      //   };
    
      //   for (var i = 0; i < obj.answers.length; i++) {
      //     createAnswers(obj, i);
      //   }
      //   cardInnerEl.style.display = "";
      // }
    
      // waitMessage.style.display = "";
    })(window.IVSPlayer);
  }
}

function displayLivePoll(pollId) {
  if (pollId && pollQuestions && Object.keys(pollQuestions).length && pollQuestions[pollId]) {
    let question = pollQuestions[pollId];
    let options = null;
    if(pollOptions && Object.keys(pollOptions).length && pollOptions[pollId]){
      options = pollOptions[pollId];
    }
    
    let optionsC = "";
    if (options && Object.keys(options).length) {
      for(let i in options) {
        optionsC += `
          <div class="form-check">
              <input class="form-check-input" type="radio" name="pollOption"
                  id="${i}" value="${i}" required>
              <label class="form-check-label" for="${i}">
                ${options[i]}
              </label>
          </div>
        `;
      }
    }

    $("#polls-container #poll-details").html(`
        <div class="card">
            <div class="card-body">
                <h5 class="card-title"></h5>
                <form id="livePollForm-${pollId}">
                    <input type="hidden" name="poll_id" value="${pollId}"/>
                    <div class="row">
                        <div class="col-12 mb-2">${question}</div>
                    </div>
                    ${optionsC}
                    <button type="submit" class="btn btn-primary mt-3">Submit</button>
                </form>
            </div>
        </div>
    `);
  }
}

function displayLiveSurvey(surveyId) {
  if (surveyQuestions && Object.keys(surveyQuestions).length) {

    let surveyForm = "";

    for(let slug in surveyQuestions) {
        let { type, question, options, isRequired } = surveyQuestions[slug];
        let requiredField = isRequired ? "required" : "";
        
        let formElem = "";
        let queField = "";
        if (options && Object.keys(options).length) {
          for(let optSlug in options) {
              switch (type) {
                  case "radio":
                      queField += `
                              <div class="form-check">
                                  <input class="form-check-input" type="radio" name="radio-${slug}"
                                      id="question1-option${optSlug}" value="${optSlug}" ${requiredField}>
                                  <label class="form-check-label" for="question1-option${optSlug}">
                                      ${options[optSlug]}
                                  </label>
                              </div>
                          `;
                      break;
                  case "checkbox":
                      queField += `
                              <div class="form-check">
                                  <input class="form-check-input" type="checkbox" name="checkbox-${slug}"
                                      id="question1-option${optSlug}" value="${optSlug}" ${requiredField}>
                                  <label class="form-check-label" for="question1-option${optSlug}">
                                      ${options[optSlug]}
                                  </label>
                              </div>
                          `;
                      break;
                  case "dropdown":
                      queField += `
                              <option value="${optSlug}">${options[optSlug]}</option>
                          `;
                      break;
                  default:
                      break;
              }
          }
        }

        switch (type) {
          case "text":
              formElem += `
                      <div class="form-group">
                          <label for="surveyQuestions[${slug}]-text">${question}</label>
                          <input type="text" class="form-control" id="surveyQuestions[${slug}]-text" name="text-${slug}" ${requiredField}/>
                      </div>
                      <hr>
                  `;
              break;
          case "radio":
          case "checkbox":
              formElem += `
                      <fieldset class="form-group">
                          <legend style="font-size: inherit;">${question}</legend>
                          ${queField}
                      </fieldset>
                      <hr>
                  `;
              break;
          case "dropdown":
              formElem += `
                      <div class="form-group">
                          <label for="surveyQuestions[${slug}]-select">${question}</label>
                          <select class="form-control" id="surveyQuestions[${slug}]-select" name="dropdown-${slug}" ${requiredField}>
                          ${queField}
                          </select>
                      </div>
                      <hr>
                  `;
              break;
          default:
              break;
      }
      surveyForm += formElem;
    }
    surveyForm += `<button type="submit" class="btn btn-primary mt-3">Submit Survey</button>`;

        $("#survey-details").html(`
          <div class="card">
              <div class="card-body">
                  <h5 class="card-title">Survey Question</h5>
                  <form id="surveyResponseForm-${surveyId}">
                      ${surveyForm}
                  </form>
              </div>
          </div>
        `);
        $("#survey-details form").on(
          "change.checkbox",
          "input[type='checkbox']",
          function () {
              if (
                  $("#survey-details form").find("input[type='checkbox']:checked")
                      .length > 0
              ) {
                  $("#survey-details form")
                      .find("input[type='checkbox']")
                      .removeAttr("required");
              } else {
                  $("#survey-details form")
                      .find("input[type='checkbox']")
                      .attr("required", "required");
              }
          }
      );
  
      $("#survey-details form").on(
          "change.radio",
          "input[type='radio']",
          function () {
              if ($("input[type='radio']:checked").length > 0) {
                  $("#survey-details form")
                      .find("input[type='radio']")
                      .removeAttr("required");
              } else {
                  $("#survey-details form")
                      .find("input[type='radio']")
                      .attr("required", "required");
              }
          }
      );
    }
  }

function submitPoll(resultJson) {
  fetch(pollAPI + '/polls/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: resultJson,
  });
}

function submitSurvey(resultJson) {
  fetch(surveyAPI + '/survey/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: resultJson,
  });
}

function getPollResults(event_id, poll_id) {
  fetch(pollAPI + `/polls/${event_id}/${poll_id}`,{
    method: "GET"
  })
    .then(response => response.json())
    .then(data => console.log('POST request successful:', data))
    .catch(error => console.error('Error making POST request:', error));
}

function getSurveyResults(event_id, survey_id) {
  fetch(surveyAPI + `/survey/${event_id}/${survey_id}`,{
    method: "GET"
  })
    .then(response => response.json())
    .then(data => console.log('POST request successful:', data))
    .catch(error => console.error('Error making POST request:', error));
}


//Global Variables

var room = {
  question: "question",
  chat: "chat",
};
var queWebSocketUrl = webSocketPollUrl = webSocketChatUrl = null;
var queWebSocket = pollWebSocket = chatWebSocket = null;
let playbackUrl = null;
var player = globalActiveTabColor = null;
const videoPlayer = document.getElementById("video-player");
var pollAPI = "https://util.streamonhub.com/event-poll-api";
var surveyAPI = "https://util.streamonhub.com/event-survey-api";
var pollQuestions = pollOptions = null;
var surveyQuestions = null;

$(document).ready(async function() {
  $(".fa-chevron-circle-right").toggle();
  // if(!(localStorage.token)) {
  //   window.location.href = "index.html";
  // }
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
  });
  
  $("#polls-container").on("submit", "form", function (e) {
    e.preventDefault();
    let poll_id = $(this).attr("id").split("-")[1];
    let optionKey = $(this).find("input[type='radio']:checked").val();
    let optionVal = $(this).find("input[type='radio']:checked").siblings('label').text().trim();
    let pollResultObj = {
      event_id: eventId,
      poll_id: poll_id,
      answer: [{[optionKey]: optionVal}],
      is_deleted: false
    };
    let pollResultJson = JSON.stringify(pollResultObj);
    submitPoll(pollResultJson);
    $("#polls-container #poll-details").html(`<p class="text-center">Your response was submitted successfully.</p>`);
  });
  
  $("#surveys-container").on("submit", "form", function (e) {
    e.preventDefault();
    let survey_id = $(this).attr("id").split("-")[1];
    let formData = $(this).serializeArray();
    const survey_data = formData.map(item => { 
      let [type, name] = (item.name).split("-");
      return { [name]: item.value, type: type }; 
    });
    // const extractedData = Object.values(formData).map(({ name, value }) => ({ [name]: value }));
    // let survey_data = [];
    // let type = $(this).find("#survey-que-type").val();
    // switch(type) {
    //   case "text":
    //     var obj = { [survey_id]: $(this).find("input[type='text']").val(), type: type };
    //     survey_data.push(obj);
    //     break;
    //   case "checkbox":
    //     let ansObj = [];
    //     $(this).find("input:checkbox:checked").each(function() {
    //       let key = $(this).val();
    //       let value = $(this).siblings("label").text().trim();
    //       ansObj.push({[key]: value});
    //     });
    //     ansObj.push({type: type});
    //     survey_data.push(ansObj);
    //     break;
    //   case "radio":
    //     let radObj = [];
    //     $(this).find("input:radio:checked").each(function() {
    //       let key = $(this).val();
    //       let value = $(this).siblings("label").text().trim();
    //       radObj.push({[key]: value});
    //     });
    //     radObj.push({type: type});
    //     survey_data.push(radObj);
    //     break;
    //   case "dropdown":
    //     let key = $(this).find("select").val();
    //     let value = $(this).find("select").siblings("label").text().trim();
    //     survey_data.push({ [key]: value, type: type });
    //     break;
    //   default:
    //     break;
    // }

    let surveyResultObj = {
      event_id: eventId,
      survey_id: survey_id,
      survey_data: survey_data,
    };
    let surveyResultJson = JSON.stringify(surveyResultObj);
    submitSurvey(surveyResultJson);
    $("#surveys-container #survey-details").html(`<p class="text-center">Your response was submitted successfully.</p>`);
  });

  $(document).on("click", ".btn-drawer", function(e) {
    e.preventDefault();
    $(".fa-chevron-circle-right").toggle();
    $(".fa-chevron-circle-left").toggle();
    var columns_container = $(".bluesec");
    if (!columns_container.hasClass("expanded")) {
      $(".videosec").removeClass("col-md-8");
      $(".videosec").addClass("col-md-4");
      
      $(".bluesec").removeClass("col-md-4");
      $(".bluesec").addClass("col-md-8");
      columns_container.toggleClass("expanded");
    } else {
      $(".videosec").removeClass("col-md-4");
      $(".videosec").addClass("col-md-8");
      
      $(".bluesec").removeClass("col-md-8");
      $(".bluesec").addClass("col-md-4");
      columns_container.toggleClass("expanded");
    }
  })
});
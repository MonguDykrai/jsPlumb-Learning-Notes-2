<template>
  <div class="jsplumb">
    <div id="menuContainer" class="menu" style="left: 20px;">
      <p style="text-align: center;">Menu</p>
      <div class="menu-button-container">
        <div class="button-add-task button menu-button ele-draggable" id="buttonAddTask" draggable="true">
          Add Task
        </div>
        <div class="button-add-decision button menu-button ele-draggable" id="buttonAddDecision" draggable="true">
          Add Decision
        </div>
        <div>
          <button id="saveButton" class="button menu-button" @click="handleSaveCanvas">
            Save
          </button>
          <button id="loadButton" class="button menu-button" style="float: right;" @click="handleLoadCanvas">
            Load
          </button>
        </div>
        <div>
          <button id="resetButton" class="button menu-button reset-button" @click="handleResetCanvas">
            Reset
          </button>
        </div>
      </div>
    </div>

    <div id="canvas">
      <Node v-for="(item, index) in nodeList" :attr="item" :nodeList="nodeList" @on-remove-node="removeNode" />
    </div>

    <textarea id="jsonOutput" style="width:100%; height:140px;" :value="jsonOutput">
    </textarea>
  </div>
</template>

<script>
  // @ is an alias to /src
  import $ from 'jquery';
  import { jsPlumb } from 'jsplumb';
  import Node from './Node'

  export default {
    name: 'jsplumb',

    components: {
      Node
    },

    data: function () {
      return {
        connections: [],
        nodeType: {
          task: {
            blockId: "",
            nodeType: "task",
            positionX: 0,
            positionY: 0,
            param: {
              processId: "",
              taskContainer: {
                useInput: true
              }
            }
          },
          decision: {
            blockId: "",
            nodeType: "decision",
            positionX: 0,
            positionY: 0,
            param: {
              processId: "",
              decision: {
                method: "Z-transformation"
              }
            }
          }
        },
        // nodeList: [
        //   {
        //     blockId: "decisioncontainer1",
        //     nodeType: "decision",
        //     positionX: 1130,
        //     positionY: 267,
        //     param: {
        //       processId: "decisioncontainer1",
        //       decision: {
        //         method: "Z-transformation"
        //       }
        //     }
        //   },
        //   {
        //     blockId: "taskcontainer2",
        //     nodeType: "task",
        //     positionX: 729,
        //     positionY: 170,
        //     param: {
        //       processId: "taskcontainer2",
        //       taskContainer: {
        //         useInput: true
        //       }
        //     }
        //   },
        //   {
        //     blockId: "decisioncontainer3",
        //     nodeType: "decision",
        //     positionX: 745,
        //     positionY: 401,
        //     param: {
        //       processId: "decisioncontainer3",
        //       decision: {
        //         method: "Z-transformation"
        //       }
        //     }
        //   },
        //   {
        //     blockId: "taskcontainer4",
        //     nodeType: "task",
        //     positionX: 328,
        //     positionY: 368,
        //     param: {
        //       processId: "taskcontainer2",
        //       taskContainer: {
        //         useInput: true
        //       }
        //     }
        //   }
        // ],
        nodeList: [],
        connections: [],
        numberOfElements: 0,
        offsetX: 0,
        offsetY: 0,
        canvasId: "#canvas",
        defaultsOption: {
          MaxConnections: 1,
          Endpoint: ["Dot", { radius: 6 }],
          EndpointStyle: { fill: "#8aa2d8" },
          EndpointHoverStyle: { fill: "#224492" },
          PaintStyle: { stroke: '#e85050', strokeWidth: 2 },
          HoverPaintStyle: { stroke: "#9e1b1b", strokeWidth: 2 },

          Connector: [
            "Straight",
            // "Flowchart",
            {
              gap: 10,
              midpoint: 0,
              stub: 2,
              cornerRadius: 2
            }
          ],

          ConnectionOverlays: [
            ["Arrow", {
              location: 1,
              id: "arrow",
              length: 10,
              width: 14,
              foldback: 0.6
            }]
          ]
        },

        flowChart: {},

        // flowChart: {
        //   "nodes": [
        //     {
        //       "blockId": "decision503114",
        //       "nodeType": "decision",
        //       "positionX": 516,
        //       "positionY": 189
        //     },
        //     {
        //       "blockId": "task504106",
        //       "nodeType": "task",
        //       "positionX": 945,
        //       "positionY": 212
        //     }
        //   ],
        //   "connections": [
        //     {
        //       "uuids": [
        //         "decision503114rm-out",
        //         "task504106lm-in"
        //       ]
        //     }
        //   ],
        //   "numberOfElements": 2
        // },

        jsonOutput: ""
      }
    },

    mounted: function () {
      const _vueThis = this;

      const requestNodeList = function () {
        return new Promise(function (resolve, reject, a) {
          fetch("http://localhost:3000/get-task-info")
            .then(res => {
              return res.json();
            }).then(data => {
              resolve(data);
            });
        });
      }

      async function init() {
        const { data } = await requestNodeList();

        _vueThis.flowChart = data;

        _vueThis.initJsplumb();

        _vueThis.loadFlowchart();
      }

      init();

      // this.initJsplumb();
    },

    methods: {
      removeNode: function (val) {
        let blockId;
        this.nodeList = JSON.parse(val).nodeList;
        blockId = JSON.parse(val).blockId;

        jsPlumb.deleteConnectionsForElement(blockId);
        jsPlumb.removeAllEndpoints(blockId);
      },
      addEndpoint: function ({ blockId, nodeType }) {
        if (nodeType == "task") {
          jsPlumb.addEndpoint(
            blockId,
            {
              uuid: blockId + "lm-in",
              isTarget: true,
              anchor: "Left"
            }
          );
        }

        if (nodeType == "decision") {
          jsPlumb.addEndpoint(
            blockId,
            {
              uuid: blockId + "ll-in",
              isTarget: true,
              anchor: [0, 0.2]
            }
          );

          jsPlumb.addEndpoint(
            blockId,
            {
              uuid: blockId + "lr-in",
              isTarget: true,
              anchor: [0, 0.8]
            }
          );
        }

        jsPlumb.addEndpoint(
          blockId,
          {
            uuid: blockId + "rm-out",
            isSource: true,
            anchor: "Right"
          }
        );

        jsPlumb.draggable(blockId);
      },
      initJsplumb: function () {
        jsPlumb.ready(() => {
          jsPlumb.importDefaults(this.defaultsOption);

          jsPlumb.bind("beforeDrop", this.handleBeforeDrop);

          $(".ele-draggable").on("dragstart", this.handleDragstart);

          $(this.canvasId).on("dragover", this.handleDragover);

          $(this.canvasId).on("drop", this.handleDrop);
        });
      },

      handleDrop: function (ev) {
        const { originalEvent } = ev;
        const posX = ev.pageX - this.offsetX; // 需要减去鼠标的偏移值
        const posY = ev.pageY - this.offsetY;

        if (!originalEvent.dataTransfer) return; // 连线时会触发 drop 事件，值为 undfined

        const data = originalEvent.dataTransfer.getData("text");

        this.addNode({ scenario: data, posX, posY });
      },

      addNode: function ({ scenario, posX, posY, blockId }) {
        let newNode,
          uuid = String(Date.now()).substr(-6);


        if (scenario.toLowerCase().indexOf("task") > -1) {
          blockId = blockId ? blockId : `task${uuid}`;

          newNode = {
            ...this.nodeType["task"],
            positionX: posX,
            positionY: posY,
            blockId,
          }

          newNode.param.processId = newNode.blockId;
        }

        if (scenario.toLowerCase().indexOf("decision") > -1) {
          blockId = blockId ? blockId : `decision${uuid}`;

          newNode = {
            ...this.nodeType["decision"],
            positionX: posX,
            positionY: posY,
            blockId,
          }

          newNode.param.processId = newNode.blockId;
        }

        this.nodeList.push(newNode);


        setTimeout(() => {
          this.addEndpoint({ blockId, nodeType: newNode.nodeType });
        }, 0);
      },

      handleDragover: function (ev) {
        ev.preventDefault();
      },

      handleBeforeDrop: function ({ sourceId, targetId }, originalEvent) {
        if (sourceId == targetId) {
          return false;
        }

        return true;
      },

      handleDragstart: function (ev) {
        const { originalEvent, target } = ev,
          targetId = target.id;

        this.offsetX = ev.offsetX;
        this.offsetY = ev.offsetY;

        originalEvent.dataTransfer.setData("text", target.id); // e.g. buttonAddTask
      },

      handleSaveCanvas: function () {
        this.saveFlowchart();
      },

      handleLoadCanvas: function () {
        this.loadFlowchart();
      },

      handleResetCanvas: function () {
        jsPlumb.empty("canvas");
        this.nodeList = [];
      },

      saveFlowchart: function () {
        const nodes = [];

        $(".node").each((idx, elem) => {
          const $elem = $(elem);
          nodes.push({
            blockId: $elem.attr("id"),
            nodeType: $elem.attr("data-nodetype"),
            positionX: parseInt($elem.css("left"), 10),
            positionY: parseInt($elem.css("top"), 10)
          });
        });

        const connections = [];

        $.each(jsPlumb.getConnections(), (idx, connection) => {
          connections.push({
            uuids: connection.getUuids()
          });
        });

        this.flowChart.nodes = nodes;
        this.flowChart.connections = connections;
        this.flowChart.numberOfElements = nodes.length;

        console.log(this.toJSON(this.flowChart));
      },

      loadFlowchart: function () {
        const _vueThis = this;

        const { nodes } = _vueThis.flowChart;

        $.each(nodes, (index, elem) => {
          const id = elem.blockId;
          const posX = elem.positionX;
          const posY = elem.positionY;

          _vueThis.addNode({ scenario: elem.nodeType, posX, posY, blockId: elem.blockId });
        });

        const { connections } = _vueThis.flowChart;

        setTimeout(() => {
          $.each(connections, function (index, elem) {
            jsPlumb.connect({
              uuids: JSON.parse(_vueThis.toJSON(elem.uuids))
            });
          });
        }, 16);
      },

      toJSON: function (src) {
        return JSON.stringify(src);
      }
    },
  };
</script>

<style>
  .window {}

  .window:hover {
    cursor: pointer;
  }

  .menu {
    background-color: #EFEFEF;
    border: 1px solid #346789;
    box-shadow: 2px 2px 5px #AAAAAA;
    color: black;
    min-height: 3em;
    position: absolute;
    min-width: 5em;
  }

  .task {
    background-color: #EEEEEF;
    border: 1px solid #346789;
    border-radius: 0.5em;
    box-shadow: 2px 2px 5px #AAAAAA;
    color: black;
    /* min-height: 3em; */
    position: absolute;
    /* min-width: 5em; */

    height: 90px;
    width: 160px;
  }

  /* Start End */
  .point {
    background-color: #333333;
    border: 1px solid #AAAAAA;
    border-radius: 50%;
    box-shadow: 2px 2px 5px #AAAAAA;
    color: white;
    min-width: 50px;
    min-height: 30px;
    font-size: 11pt;
    padding: 10px;
    position: absolute;
    text-align: center;
  }

  .point:hover {
    box-shadow: 2px 2px 19px #AAAAAA;
  }

  .decision {
    /* transform: rotate(-45deg); */
    overflow: hidden;
    border: 1px solid #346789;
    border-radius: 0.3em;
    color: black;
    backface-visibility: hidden;
    background: none repeat scroll 0 0 #F4F4F4;
    box-shadow: 0 0 0 1px #CCCCCC;
    color: #000000;
    display: block;
    /* height: 80px; */
    height: 90px;
    overflow: hidden;
    /* position: relative; */
    position: absolute;
    text-decoration: none;
    /* width: 80px; */
    width: 160px;
  }

  .decision .ctrl-container {
    display: table-cell;
    height: 80px;
    padding: 0 10px;
    text-align: center;
    /* transform: rotate(45deg); */
    vertical-align: middle;
    width: 80px;
  }

  .button {
    text-align: center;
    border: 1px solid;
    margin: 5px;
  }

  .button:hover {
    cursor: pointer;
  }

  .menu-button {
    padding: 5px;
  }

  .menu-button:hover {
    background-color: #AAAAAA;
    color: black;
  }

  .button_add {
    background-color: #00CC00;
    float: left;
    border-radius: 50%;
    box-shadow: 0px 3px 8px #aaa, inset 0px 2px 3px #fff;
    padding: 2px;
    height: 25px;
    width: 25px;
    color: grey;
  }

  .button_add:hover {
    background-color: #00AA00;
    color: black;
  }

  .button-remove {
    font-size: 9pt;
    color: darkgrey;
    border-radius: 30%;
    box-shadow: 0px 3px 8px #aaa, inset 0px 2px 3px #fff;
    padding: 5px;
    min-width: 10px;
    max-width: 15px;
    text-align: center;
  }

  .task .button-remove {
    float: right;
  }

  .decision .button-remove {
    margin: auto auto;
  }

  .button-remove:hover {
    background-color: darkred;
    color: white;
  }

  .menu-button-container {
    margin: 5px;
  }

  .ctrl-container {
    margin: 5px;
    height: 40px;
  }

  .details-container {
    margin: 5px;
    min-height: 40px;
  }

  .detail-label {
    font-size: 9pt;
    color: grey;
  }

  .detail-text {
    width: 80px;
    font-size: 10pt;
  }

  ._jsPlumb_connector,
  ._jsPlumb_startpoint {
    cursor: pointer;
  }

  .reset-button {
    float: right;
    margin-bottom: 10px;
    background: rgba(0, 169, 200, 1);
  }

  #canvas {
    margin-bottom: 6px;
    width: 100%;
    min-height: 700px;
    background: #d6d6d6;
  }
</style>
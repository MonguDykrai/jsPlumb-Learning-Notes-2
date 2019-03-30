<template>
  <div class="jsplumb">
    <div
    id="menuContainer"
    class="menu"
    style="left: 20px;"
    >
      <p style="text-align: center;">Menu</p>
      <div class="menu-button-container">
        <div
          class="button-add-task button menu-button ele-draggable"
          id="buttonAddTask"
          draggable="true"
        >
          Add Task
        </div>
        <div
          class="button-add-decision button menu-button ele-draggable"
          id="buttonAddDecision"
          draggable="true"
        >
          Add Decision
        </div>
        <div>
          <button
            id="saveButton"
            class="button menu-button"
            @click="handleSaveCanvas"
          >
            Save
          </button>
          <button
            id="loadButton"
            class="button menu-button"
            style="float: right;"
            @click="handleLoadCanvas"
          >
            Load
          </button>
        </div>
        <div>
            <button
              id="resetButton"
              class="button menu-button reset-button"
              @click="handleResetCanvas"
            >
              Reset
            </button>
        </div>
      </div>
    </div>

    <div id="canvas"></div>

    <textarea
      id="jsonOutput"
      style="width:100%; height:140px;"
      :value="jsonOutput"
    >
    </textarea>
  </div>
</template>

<script>
// @ is an alias to /src
import $ from 'jquery';
import { jsPlumb } from 'jsplumb';

export default {
  name: 'jsplumb',

  data: function () {
    return {
      offsetX: 0,
      offsetY: 0,
      numberOfElements: 0,
      canvasId: "#canvas",
      defaultsOption: {
        MaxConnections: 1,
        Endpoint: ["Dot", { radius: 6 }],
        EndpointStyle: { fill: "#8aa2d8" },
        EndpointHoverStyle: { fill: "#224492" },
        PaintStyle: { stroke: '#e85050', strokeWidth: 2 },
        HoverPaintStyle: { stroke: "#9e1b1b", strokeWidth: 2 },

        Connector: [
          "Flowchart",
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

      jsonOutput: '{"nodes":[{"blockId":"decisioncontainer1","nodetype":"decision","positionX":1130,"positionY":267},{"blockId":"taskcontainer2","nodetype":"task","positionX":729,"positionY":170},{"blockId":"decisioncontainer3","nodetype":"decision","positionX":745,"positionY":401},{"blockId":"taskcontainer4","nodetype":"task","positionX":328,"positionY":368},{"blockId":"datasource2","nodetype":"task","positionX":85,"positionY":376},{"blockId":"datasource1","nodetype":"task","positionX":272,"positionY":186}],"connections":[{"connectionId":"con_21","sourceId":"taskcontainer2","targetId":"decisioncontainer1","uuids":["taskcontainer2rm-out","decisioncontainer1ll-in"]},{"connectionId":"con_22","sourceId":"decisioncontainer3","targetId":"decisioncontainer1","uuids":["decisioncontainer3rm-out","decisioncontainer1lr-in"]},{"connectionId":"con_23","sourceId":"taskcontainer4","targetId":"decisioncontainer3","uuids":["taskcontainer4rm-out","decisioncontainer3ll-in"]},{"connectionId":"con_31","sourceId":"datasource2","targetId":"taskcontainer4","uuids":["datasource2rm-out","taskcontainer4lm-in"]},{"connectionId":"con_39","sourceId":"datasource1","targetId":"taskcontainer2","uuids":["datasource1rm-out","taskcontainer2lm-in"]}],"numberOfElements":6}',
    }
  },

  created: function () {
    this.initJsplumb();
  },

  methods: {
    initJsplumb: function () {
      jsPlumb.ready(() => {

        jsPlumb.importDefaults(this.defaultsOption);

        $(this.canvasId).on("click", ".button-remove", function () {
          const parentnode = $(this)[0].parentNode.parentNode;
          jsPlumb.deleteConnectionsForElement(parentnode);
          jsPlumb.removeAllEndpoints(parentnode);
          $(parentnode).remove();
        });

        $(this.canvasId).on("click", ".button-excute", function () {
          const parentNodeId = this.parentNode.id;

          var dependencyGraph = {};

          function logDependency(id) {
            if (id.indexOf("datasource") >= 0) {
              return;
            }

            const nodeId = document.querySelector(`#${id}`);

            jsPlumb.getEndpoints(nodeId).forEach(item => {
              if (item.isTarget) {
                if (item.connections.length > 0) {

                  function checkPosition() {
                    let position;

                    const isLeft = item.connections[0].getUuids().some(item => {
                      return item.indexOf("ll-") > 0;
                    });

                    const isRight = item.connections[0].getUuids().some(item => {
                      return item.indexOf("lr-") > 0;
                    });

                    if (isLeft) {
                      position = "left";
                    }

                    if (isRight) {
                      position = "right";
                    }

                    return position;
                  }

                  const position = checkPosition();

                  
                  const targetId = item.connections[0].targetId;
                  const targetParams = ($(`#${targetId}`).data("param"));

                  const sourceId = item.connections[0].source.id;
                  const sourceParams = ($(`#${sourceId}`).data("param"));

                  if (!dependencyGraph[targetId]) {
                    dependencyGraph[targetId] = { collection: [], targetId };
                  }

                  dependencyGraph[targetId].collection.push({ position, targetId, sourceId });
                }
              }
            });

            let sourceIds = [];

            Object.keys(dependencyGraph).forEach(key => {
              let value = dependencyGraph[key];
              sourceIds = value.collection.map(item => {
                return item.sourceId;
              });
            });

            sourceIds.forEach(sourceId => {
              return logDependency(sourceId);
            });

            return dependencyGraph;
          }

          logDependency(parentNodeId);

          console.log(dependencyGraph);

          // Object.keys(dependencyGraph).forEach(key => {
          //   let value = dependencyGraph[key];
          //   console.log(value);
          // });
        });

        jsPlumb.bind("connection", (connection, originalEvent) => {
          // console.log(connection);

          // console.log(jsPlumb.getConnections())

          // this.saveFlowchart();

          // console.log(this.flowChart);
        });

        // jsPlumb.bind("connectionDetached", (connection, originalEvent) => {
        //   console.log(connection);
        // });

        jsPlumb.bind("beforeDrop", this.handleBeforeDrop);

        $(".ele-draggable").on("dragstart", this.handleDragstart);

        $(this.canvasId).on("dragover", this.handleDragover);

        $(this.canvasId).on("drop", this.handleDrop);
      });
    },

    repositionElement: function ({ id, posX, posY }) {
      $(`#${id}`).css("left", posX);
      $(`#${id}`).css("top", posY);
      jsPlumb.repaint(id);
    },

    addNode: function ({ id, posX, posY, scenario }) {
      // console.error(scenario);
      if (typeof id == "undefined") {
        this.numberOfElements++;
        id = `${scenario}container` + this.numberOfElements;
      }

      // data-param='{"processId":"${id}","attributeFilterType":"all","method":"Z-transformation"}'

      const taskNode = `
        <div class="window task node" id="${id}"
          data-nodetype="task"
          style="left: ${posX}px; top: ${posY}px;"
          data-param='{"processId":"${id}","method":"Z-transformation"}'
        >
          <div class="ctrl-container">
            <div class="button-remove">x</div>
          </div>

          <img
            class="button-excute"
            src="https://upload-images.jianshu.io/upload_images/12334242-02c3d1c5ef32a57d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240"
            style="position: absolute; top: 20px; width: 30px; transform: translateX(-50%);"
          />

          <div 
            class="details-container"
            style="display: flex; justify-content: center; align-items: center;"
          >
            <!-- <label class="detail-label">Name</label> -->
            <!-- <input class="detail-text" /> -->
            <span
              style="color: red; font-weight: 700; font-size: 10px;"
            >
              ${id}
            </span>
          </div>
        </div>
      `;

      // data-param='{"processId":"taskcontainer1","useInput":true,"cacheProcess":true}'

      const decisionNode = `
        <div
          class="window decision node"
          id="${id}"
          data-nodetype="decision"
          style="left: ${posX}px; top: ${posY}px;"
          data-param='{"processId":"${id}","useInput":true}'
        >
          <div class="ctrl-container" style="margin-top: -10px;">
            <div class="button-remove" style="position: absolute; right: 4px; top: 6px;">x</div>
          </div>

          <img
            class="button-excute"
            src="https://upload-images.jianshu.io/upload_images/12334242-02c3d1c5ef32a57d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240"
            style="position: absolute; top: 20px; width: 30px; transform: translateX(-50%);"
          />

          <div
            class="details-container"
            style="margin: -20px 0 0 6px; min-height: 20px; font-size: 12px; text-align: center; display: flex; justify-content: center; align-items: center;"
          >
            <span style="color: blue; font-weight: 700; font-size: 10px;">${id}</span>
          </div>
        </div>
      `;

      if (scenario == "task") {
        $(taskNode).appendTo(this.canvasId);
      }

      if (scenario == "decision") {
        $(decisionNode).appendTo(this.canvasId);
      }

      this.addEndpoint({ id, scenario });

      jsPlumb.draggable(id);
    },

    addEndpoint: function ({ id, scenario }) {
      if (scenario == "task") {
        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "lm-in",
            isTarget: true,
            anchor: [0, 0.5]
          }
        );

        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "rm-out",
            isSource: true,
            anchor: "Right"
          }
        );
      }

      if (scenario == "decision") {
        // jsPlumb.addEndpoint(
        //   id,
        //   {
        //     uuid: id + "lt-in",
        //     isTarget: true,
        //     anchor: [0, 0.2]
        //   }
        // );

        // jsPlumb.addEndpoint(
        //   id,
        //   {
        //     uuid: id + "lm-in",
        //     isTarget: true,
        //     anchor: [0, 0.5]
        //   }
        // );

        // jsPlumb.addEndpoint(
        //   id,
        //   {
        //     uuid: id + "lb-in",
        //     isTarget: true,
        //     anchor: [0, 0.8]
        //   }
        // );

        // jsPlumb.addEndpoint(
        //   id,
        //   {
        //     uuid: id + "tm-in",
        //     isTarget: true,
        //     anchor: [0.5, 0, 0, -1, 0, 0],
        //   }
        // );

        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "ll-in",
            isTarget: true,
            anchor: [0, 0.2]
          }
        );

        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "lr-in",
            isTarget: true,
            anchor: [0, 0.8]
          }
        );

        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "rm-out",
            isSource: true,
            anchor: "Right"
          }
        );
      }
    },

    handleSaveCanvas: function () {
      this.saveFlowchart();
    },

    handleLoadCanvas: function () {
      this.loadFlowchart();
    },

    handleResetCanvas: function () {
      jsPlumb.empty("canvas");
    },

    saveFlowchart: function () {
      const nodes = [];

      $(".node").each((idx, elem) => {
        const $elem = $(elem);
        nodes.push({
          blockId: $elem.attr("id"),
          nodetype: $elem.attr("data-nodetype"),
          positionX: parseInt($elem.css("left"), 10),
          positionY: parseInt($elem.css("top"), 10)
        });
      });

      const connections = [];

      $.each(jsPlumb.getConnections(), (idx, connection) => {
        connections.push({
          connectionId: connection.id,
          sourceId: connection.sourceId,
          targetId: connection.targetId,
          uuids: connection.getUuids()
        });
      });

      this.flowChart.nodes = nodes;
      this.flowChart.connections = connections;
      this.flowChart.numberOfElements = this.numberOfElements;
      const flowChartJson = JSON.stringify(this.flowChart);

      this.jsonOutput = flowChartJson;

      // $("#jsonOutput").val(this.flowChartJson);
    },

    loadFlowchart: function () {
      this.flowChartJson = this.jsonOutput;
      const flowChart = JSON.parse(this.flowChartJson);
      const nodes = flowChart.nodes;

      $.each(nodes, (index, elem) => {
        const id = elem.blockId;
        const posX = elem.positionX;
        const posY = elem.positionY;

        if (elem.nodetype == "task") {
          this.addNode({ id, posX, posY, scenario: "task" });
          this.repositionElement({ id, posX, posY });
        }

        if (elem.nodetype == "decision") {
          this.addNode({ id, posX, posY, scenario: "decision" });
          this.repositionElement({ id, posX, posY });
        }
      });

      const connections = flowChart.connections;

      $.each(connections, function (index, elem) {
        jsPlumb.connect({
          uuids: elem.uuids
        })
      });

      this.numberOfElements = flowChart.numberOfElements;
    },

    handleDrop: function (ev) {
      const { originalEvent } = ev;
      const posX = ev.pageX - this.offsetX; // 需要减去鼠标的偏移值
      const posY = ev.pageY - this.offsetY;
      
      if (!originalEvent.dataTransfer) return; // 连线时会触发 drop 事件，值为 undfined

      const data = originalEvent.dataTransfer.getData("text");

      if (data == "buttonAddTask") {
        this.addNode({ posX, posY, scenario: "task" });
      }

      if (data == "buttonAddDecision") {
        this.addNode({ posX, posY, scenario: "decision" });
      }
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
      const { originalEvent, target } = ev;
      this.offsetX = ev.offsetX;
      this.offsetY = ev.offsetY;

      originalEvent.dataTransfer.setData("text", target.id); // e.g. buttonAddTask
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
  width:100%;
  min-height:700px;
  background: #d6d6d6;
}
</style>

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

    <jsp-canvas ref="refJspCanvas" />

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
import JspCanvas from '../components/JspCanvas';
import TaskNode from '../components/TaskNode';
import DecisionNode from '../components/DecisionNode';
import Vue from 'vue';
import { setTimeout } from 'timers';

const Event = new Vue();

export default {
  name: 'jsplumb',

  components: {
    JspCanvas
  },

  mounted: function () {
    this.jspCanvasVueIns = this.$refs["refJspCanvas"]

    // console.log(this.jspCanvasVueIns)
    this.initJsplumb();
  },

  data: function () {
    return {
      removeEventFlag: false,
      jspCanvasVueIns: {},
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

      jsonOutput: '{"nodes":[{"blockId":"taskcontainer1","nodetype":"task","positionX":202,"positionY":108},{"blockId":"taskcontainer2","nodetype":"decision","positionX":1137,"positionY":251},{"blockId":"taskcontainer3","nodetype":"decision","positionX":1386,"positionY":249},{"blockId":"taskcontainer4","nodetype":"task","positionX":873,"positionY":110},{"blockId":"taskcontainer5","nodetype":"decision","positionX":442,"positionY":426},{"blockId":"taskcontainer6","nodetype":"decision","positionX":1601,"positionY":317}],"connections":[{"connectionId":"con_37","sourceId":"taskcontainer1","targetId":"taskcontainer4","uuids":["taskcontainer1rm-out","taskcontainer4lt-in"]},{"connectionId":"con_38","sourceId":"taskcontainer2","targetId":"taskcontainer3","uuids":["taskcontainer2rm-out","taskcontainer3lm-in"]},{"connectionId":"con_39","sourceId":"taskcontainer5","targetId":"taskcontainer4","uuids":["taskcontainer5rm-out","taskcontainer4lm-in"]},{"connectionId":"con_40","sourceId":"taskcontainer4","targetId":"taskcontainer2","uuids":["taskcontainer4rm-out","taskcontainer2lm-in"]},{"connectionId":"con_41","sourceId":"taskcontainer3","targetId":"taskcontainer6","uuids":["taskcontainer3rm-out","taskcontainer6lm-in"]}],"numberOfElements":6}',
    }
  },

  methods: {
    mountComp: function (comp, props) {
      if (comp.default) {
        comp = comp.default;
      }

      // https://vuejs.org/v2/api/#Vue-extend
      comp = Vue.extend(comp);

      let node = document.createElement("span"); // 节点类型无所谓 span div ...

      this.jspCanvasVueIns.$el.appendChild(node);

      new comp({
        el: node, // 替换掉 node?
        propsData: props,
        parent: this
      });
    },

    initJsplumb: function () {
      jsPlumb.ready(() => {

        jsPlumb.importDefaults(this.defaultsOption);

        

        jsPlumb.bind("connection", (connection, originalEvent) => {
          // console.log(connection);

          this.saveFlowchart();

          // console.log(this.flowChart);
        });

        // jsPlumb.bind("connectionDetached", (connection, originalEvent) => {
        //   console.log(connection);
        // });

        jsPlumb.bind("beforeDrop", this.handleBeforeDrop);

        $(".ele-draggable").on("dragstart", this.handleDragstart);

        $(this.canvasId).on("dragover", this.handleDragover);

        $(this.canvasId).on("drop", this.handleDrop);

        this.loadFlowchart();
      });

    },

    handleRemove: function (grandsonIns) {
      if (!this.removeEventFlag) {
        $(this.canvasId).on("click", ".button-remove", (e) => {
          this.removeEventFlag = true;
          const { currentTarget } = e;
          const parentnode = $(currentTarget)[0].parentNode.parentNode;
          jsPlumb.deleteConnectionsForElement(parentnode);
          jsPlumb.removeAllEndpoints(parentnode);
          $(parentnode).remove();
          grandsonIns.$destroy();

          this.numberOfElements = this.numberOfElements - 1;
          this.saveFlowchart();
        });
      }

      document.querySelector('.button-remove').click();
    },

    repositionElement: function ({ id, posX, posY }) {
      $(`#${id}`).css("left", posX);
      $(`#${id}`).css("top", posY);
      jsPlumb.repaint(id);
    },

    addNode: function ({ id, posX, posY, scenario }) {
      if (typeof id == "undefined") {
        this.numberOfElements++;
        id = "taskcontainer" + this.numberOfElements;
      }

      // const taskNode = `
      //   <div class="window task node" id="${id}" data-nodetype="task" style="left: ${posX}px; top: ${posY}px;">
      //     <div class="ctrl-container">
      //       <div class="button-remove">x</div>
      //     </div>
      //     <div class="details-container">
      //       <label class="detail-label">Name</label>
      //       <input class="detail-text" />
      //     </div>
      //   </div>
      // `;

      // const decisionNode = `
      //   <div class="window decision node" id="${id}" data-nodetype="decision" style="left: ${posX}px; top: ${posY}px;">
      //     <div class="ctrl-container" style="margin-top: -10px;">
      //       <div class="button-remove">x</div>
      //     </div>
      //     <div
      //       class="details-container"
      //       style="margin: -20px 0 0 6px; min-height: 20px; font-size: 12px; text-align: center;"
      //     >
      //       <span>Decision</span>
      //     </div>
      //   </div>
      // `;

      if (scenario == "task") {
        // $(taskNode).appendTo(this.canvasId);
        this.mountComp(TaskNode, { prop: { id, posX, posY } });
      }

      if (scenario == "decision") {
        // $(decisionNode).appendTo(this.canvasId);
        this.mountComp(DecisionNode, { prop: { id, posX, posY } });
      }

      this.addEndpoint({ id, scenario });

      jsPlumb.draggable(id);
    },

    addEndpoint: function ({ id, scenario }) {
      if (scenario == "task") {
        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "lt-in",
            isTarget: true,
            anchor: [0, 0.2]
          }
        );

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
            uuid: id + "lb-in",
            isTarget: true,
            anchor: [0, 0.8]
          }
        );

        jsPlumb.addEndpoint(
          id,
          {
            uuid: id + "tm-in",
            isTarget: true,
            anchor: [0.5, 0, 0, -1, 0, 0],
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
    },

    handleSaveCanvas: function () {
      this.saveFlowchart();
    },

    handleLoadCanvas: function () {
      this.loadFlowchart();
    },

    handleResetCanvas: function () {
      // this.$children.forEach((item, index) => {
      //   console.log(index)
      //   // item.$destroy();
      // });
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
  min-height: 3em;
  position: absolute;
  min-width: 5em;
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
  height: 80px;
  overflow: hidden;
  /* position: relative; */
  position: absolute;
  text-decoration: none;
  width: 80px;
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

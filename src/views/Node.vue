<template>
  <div
    class="window task node"
    :id="attr.blockId"
    :data-nodetype="attr.nodeType"
    :style="{ left: `${attr.positionX}px`, top: `${attr.positionY}px` }"
    :data-param="JSON.stringify(attr.param)"
  >
    <div class="ctrl-container">
      <div class="button-remove" @click="removeNode">x</div>
    </div>

    <img class="button-excute"
      src="https://upload-images.jianshu.io/upload_images/12334242-02c3d1c5ef32a57d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240"
      style="position: absolute; top: 20px; width: 30px; transform: translateX(-50%);" />

    <div
      class="details-container"
      style="display: flex; justify-content: center; align-items: center;"
    >
      <span style="color: red; font-weight: 700; font-size: 10px;">
        {{ attr.blockId }}
      </span>
    </div>
  </div>
</template>

<script>
  import $ from "jquery";

  export default {
    name: "node",
    props: {
      attr: {
        type: Object
      },
      nodeList: {
        type: Array
      }
    },
    data: function () {
      return {}
    },
    methods: {
      removeNode: function (e) {
        const blockId = this.attr.blockId;

        this.removeNode.index = 0;
        const objectNodeList = JSON.parse(this.toJSON(this.nodeList));

        this.nodeList.forEach((node, index) => {
          if (this.toJSON(node) == this.toJSON(this.attr)) {
            this.removeNode.index = index;
          }
        });

        objectNodeList.splice(this.removeNode.index, 1);

        this.$emit("on-remove-node", this.toJSON({ nodeList: objectNodeList, blockId }));
      },
      toJSON: function (str) {
        return this.$parent.toJSON(str);
      }
    }
  }
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
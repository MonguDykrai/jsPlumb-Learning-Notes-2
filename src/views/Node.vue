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
    <div v-if="attr.nodeType == 'task'">
      <input type="text" :value="task.input" placeholder="输点什么：">
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
      return {
        task: {
          input: ""
        }
      }
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

        // objectNodeList.forEach(node => {
        //   node.blockId = `${node.blockId}1`
        // });

        this.$emit("on-remove-node", this.toJSON({ nodeList: objectNodeList, blockId }));
      },
      toJSON: function (str) {
        return this.$parent.toJSON(str);
      }
    }
  }
</script>

<style></style>
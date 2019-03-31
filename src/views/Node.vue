<template>
  <div class="window task node" :id="attr.blockId" :data-nodetype="attr.nodeType"
    :style="{ left: `${attr.positionX}px`, top: `${attr.positionY}px` }" :data-params="JSON.stringify(attr.params)">
    <div class="ctrl-container">
      <div class="button-remove" @click="removeNode">x</div>
    </div>

    <img class="button-excute" @click="checkProcess"
      src="https://upload-images.jianshu.io/upload_images/12334242-02c3d1c5ef32a57d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240"
      style="position: absolute; top: 20px; width: 30px; transform: translateX(-50%);" />

    <div class="details-container" style="display: flex; justify-content: center; align-items: center;">
      <span style="color: red; font-weight: 700; font-size: 10px;">
        {{ attr.blockId }}
      </span>
    </div>
    <div v-if="attr.nodeType == 'task'">
      <input type="text" v-model="task.task.useInput" placeholder="输点什么：">
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
          task: {
            useInput: true
          }
        }
      }
    },
    methods: {
      checkPosition: function (item) {
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
      },
      toObject: function (src) {
        return JSON.parse(src);
      },
      querySelector: function (id) {
        return document.querySelector(`#${id}`);
      },
      getParams: function (id) {
        return this.querySelector(id).dataset.params;
      },
      checkFlow: function ({ id, processCollection }) {
        const nodeId = this.querySelector(id);

        jsPlumb.getEndpoints(nodeId).forEach(item => {
          if (item.isTarget) {
            if (item.connections.length > 0) {

              const position = this.checkPosition(item);

              const targetId = item.connections[0].targetId;
              const targetParams = this.toObject(this.getParams(targetId));

              const sourceId = item.connections[0].source.id;
              const sourceParams = this.toObject(this.getParams(sourceId));

              const collectionItem = {
                id: sourceId,
                pid: targetId,
                targetParams,
                sourceParams,
                position
              };

              if (!collectionItem.position) {
                delete collectionItem.position;
              }

              if (collectionItem.pid) {
                delete collectionItem.targetParams;
              }

              processCollection.push(collectionItem);
              return this.checkFlow({ id: sourceId, processCollection });
            }
          }
        });
      },
      checkProcess: function (e) {
        const blockId = this.attr.blockId;
        const sourceParams = this.toObject(this.getParams(blockId));
        const processCollection = [{ id: blockId, pid: null, sourceParams }];

        this.checkFlow({ id: blockId, processCollection });

        // let uniqKeys = [];
        // processCollection.forEach(collect => {
        //   uniqKeys.push(collect.id);

        //   if (collect.pid) {
        //     uniqKeys.push(collect.pid);
        //   }
        // });

        // uniqKeys = Array.from(new Set(uniqKeys));

        // console.log(uniqKeys);

        // uniqKeys.forEach(key => {

        // });

        // console.log(processCollection);

        const familyTree = this.toFamily(processCollection);

        console.log(this.toJSON(familyTree));
      },
      toFamily: function (source) {
        let jsonSource = JSON.stringify(source),
          objectSource = JSON.parse(jsonSource),
          resArr = [],
          jsonObjSource,
          objectObjSource;

        objectSource.forEach(item => {
          item.children = [];
        });

        objectSource.forEach(outerItem => {
          objectSource.forEach(innerItem => {
            if (innerItem.pid == outerItem.id) {
              outerItem.children.push(innerItem);
            }
          });
        });

        jsonObjSource = JSON.stringify(objectSource);
        objectObjSource = JSON.parse(jsonObjSource);

        objectObjSource.forEach((item, index) => {
          if (!(item.pid != null && item.children.length >= 0)) {
            resArr.push(item);
          }
        });

        return resArr;
      },
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
    },
    watch: {
      task: {
        handler: function (newTask) {
          this.$emit("on-update-params", { id: this.$el.id, params: newTask });
        },
        deep: true
      }
    }
  }
</script>

<style></style>
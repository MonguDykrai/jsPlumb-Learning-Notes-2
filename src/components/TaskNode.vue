<template>
  <div
    class="window task node"
    :id="prop.id"
    data-nodetype="task"
    :style="{ left: `${prop.posX}px`, top: `${prop.posY}px`}"
  >
    <div class="ctrl-container">
      <div class="button-remove" @click="removeNode">x</div>
    </div>
    <div class="details-container">
      <label class="detail-label">Name</label>
      <input class="detail-text">
    </div>
  </div>
</template>

<script>
export default {
  name: "task-node",

  props: ["prop"],
  
  methods: {
    removeNode: function () {
      console.error(this)
     this.$parent.handleRemove(this)
    }
  }
};
</script>

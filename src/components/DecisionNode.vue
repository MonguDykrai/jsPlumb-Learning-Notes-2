<template>
  <div
    class="window decision node"
    :id="prop.id"
    data-nodetype="decision"
    :style="{ left: `${prop.posX}px`, top: `${prop.posY}px` }"
  >
    <div class="ctrl-container" style="margin-top: -10px;">
      <div class="button-remove" @click="removeNode">x</div>
    </div>
    <div
      class="details-container"
      style="margin: -20px 0 0 6px; min-height: 20px; font-size: 12px; text-align: center;"
    >
      <span>Decision</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "decision-node",

  props: ["prop"],

  methods: {
    removeNode: function () {
     this.$parent.handleRemove(this)
    }
  }
}
</script>

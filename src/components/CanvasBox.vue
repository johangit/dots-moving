<style scoped lang="scss">
.canvas-box {
    background-color: #333;
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    right: 0;
    top: 0;
    border: 0;
    z-index: 1;
}
</style>


<template>
    <canvas class="canvas-box"
            ref="canvasNode"
            v-if="isReady">
    </canvas>
</template>


<script>
import {degToRad} from "../assets/utilities";
import {Box} from "../assets/signals/box";

export default {
    name: "CanvasBox",
    data: () => ({
        isReady: false,
    }),
    methods: {
        init() {
            this.isReady = true;

            this.$nextTick(() => {
                const canvasWidth = window.innerWidth;
                const canvasHeight = window.innerHeight;
                const dpr = window.devicePixelRatio || 1;

                const signalsBox = new Box({
                    node: this.$refs.canvasNode,
                    width: canvasWidth,
                    height: canvasHeight,
                    devicePixelRatio: dpr,
                    signalsQty: 1
                });

                signalsBox.render();
            });
        },
    },
    mounted() {
        this.init();
    },
}
</script>


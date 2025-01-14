import { Export } from "../../types/enum";
import { IRenderManager } from "../../types";
import { LazyCanvas } from "../LazyCanvas";
import { SKRSContext2D } from "@napi-rs/canvas";
import { Group } from "../components/Group";

export class RenderManager implements IRenderManager {
    lazyCanvas: LazyCanvas;

    constructor(lazyCanvas: LazyCanvas) {
        this.lazyCanvas = lazyCanvas;
    }

    /**
     * This will render all the layers and return the rendered canvas buffer or ctx.
     * @returns {Promise<Buffer | SKRSContext2D>}
     */
    public async render(): Promise<Buffer | SKRSContext2D> {
        for (const layer of this.lazyCanvas.layers.toArray()) {
            if (layer.visible) {
                if (layer instanceof Group) {
                    for (const subLayer of layer.components) {
                        if (subLayer.visible) {
                            await subLayer.draw(this.lazyCanvas.ctx, this.lazyCanvas.canvas);
                        }
                    }
                } else {
                    await layer.draw(this.lazyCanvas.ctx, this.lazyCanvas.canvas);
                }
                this.lazyCanvas.ctx.shadowColor = 'transparent';
            }
        }

        switch (this.lazyCanvas.exportType) {
            case Export.Buffer:
                return this.lazyCanvas.canvas.toBuffer('image/png');
            case Export.CTX:
                return this.lazyCanvas.ctx;
            case Export.SVG:
                // @ts-ignore
                return this.lazyCanvas.canvas.getContent().toString('utf8');
            default:
                return this.lazyCanvas.canvas.toBuffer('image/png');
        }
    }
}

import { get } from "svelte/store"
import type { ShowType } from "../../../types/Show"
// ----- FreeShow -----
// This is for media/file functions

import type { Styles } from "../../../types/Settings"
import { audioExtensions, imageExtensions, mediaCache, videoExtensions } from "../../stores"
import type { MediaStyle } from "../../../types/Main"

export function getExtension(path: string): string {
    if (!path) return ""
    if (path.indexOf(".") < 0) return path
    if (path.includes("?")) path = path.slice(0, path.indexOf("?"))
    return path.substring(path.lastIndexOf(".") + 1).toLowerCase()
}

export function removeExtension(name: string): string {
    if (name.indexOf(".") < 0) return name
    return name.slice(0, name.lastIndexOf("."))
}

export function isMediaExtension(extension: string, audio: boolean = false): boolean {
    let extensions: string[] = [...get(imageExtensions), ...get(videoExtensions)]
    if (audio) extensions = get(audioExtensions)
    return extensions.includes(extension.toLowerCase())
}

export function getMediaType(extension: string): ShowType {
    if (get(audioExtensions).includes(extension.toLowerCase())) return "audio"
    if (get(videoExtensions).includes(extension.toLowerCase())) return "video"
    return "image"
}

export function getFileName(path: string): string {
    if (!path) return ""
    if (path.indexOf("\\") > -1) return path.substring(path.lastIndexOf("\\") + 1)
    if (path.indexOf("/") > -1) return path.substring(path.lastIndexOf("/") + 1)
    return path
}

export function splitPath(path: string): string[] {
    if (!path) return []
    if (path.indexOf("\\") > -1) return path.split("\\")
    if (path.indexOf("/") > -1) return path.split("/")
    return []
}

// convert to base64
export async function toDataURL(url: string) {
    return new Promise((resolve: any) => {
        var xhr = new XMLHttpRequest()
        xhr.onload = () => {
            var reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(xhr.response)
        }
        xhr.open("GET", url)
        xhr.responseType = "blob"
        xhr.send()
    })
}

// check if media file exists in plain js
export function checkMedia(src: string) {
    let extension = getExtension(src)
    let isVideo = get(videoExtensions).includes(extension)
    let isAudio = !isVideo && get(audioExtensions).includes(extension)

    return new Promise((resolve) => {
        let elem
        if (isVideo) {
            elem = document.createElement("video")
            elem.onloadeddata = () => resolve("true")
        } else if (isAudio) {
            elem = document.createElement("audio")
            elem.onloadeddata = () => resolve("true")
        } else {
            elem = new Image()
            elem.onload = () => resolve("true")
        }

        elem.onerror = () => {
            // remove cached thumbnail
            mediaCache.update((a) => {
                delete a[src]
                return a
            })

            resolve("false")
        }
        elem.src = src
    })
}

export function getMediaStyle(mediaObj: MediaStyle, currentStyle: Styles) {
    if (!mediaObj) return {}

    let mediaStyle: MediaStyle = {
        filter: "",
        flipped: false,
        flippedY: false,
        fit: "contain",
        speed: "1",
        fromTime: 0,
        toTime: 0,
    }

    Object.keys(mediaStyle).forEach((key) => {
        if (!mediaObj[key]) return
        mediaStyle[key] = mediaObj[key]
    })

    if (currentStyle?.fit) mediaStyle.fit = currentStyle.fit

    return mediaStyle
}

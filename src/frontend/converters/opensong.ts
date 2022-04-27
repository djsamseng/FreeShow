import { drawerTabsData, activePopup, groups } from "./../stores"
import { get } from "svelte/store"
import { ShowObj } from "./../classes/Show"
import { uid } from "uid"
import { history } from "../components/helpers/history"
import { checkName } from "../components/helpers/show"

interface Song {
  title: string
  author: string
  copyright: string
  // presentation: string
  // capo: string
  // tempo: string
  ccli: string
  // theme: string
  // user1: string
  // user2: string
  // user3: string
  lyrics: string[]
  hymn_number: string
  key: string
  // aka: string
  // key_line: string
  // linked_songs: string
  time_sig: string
  backgrounds: string
}

export function convertOpenSong(data: any) {
  data?.forEach(({ content }: any) => {
    console.log(content)
    let song = XMLtoObject(content)
    console.log(song)

    let category = get(drawerTabsData).shows.activeSubTab
    if (category === "all" || category === "unlabeled") category = null

    let layoutID = uid()
    let show = new ShowObj(false, category || null, layoutID)
    show.name = checkName(song.title)
    show.meta = {
      title: show.name,
      author: song.author,
      copyright: song.copyright,
      ccli: song.ccli,
    }

    let { slides, layout }: any = createSlides(song)

    show.slides = slides
    show.layouts = { [layoutID]: { name: "", notes: "", slides: layout } }

    history({ id: "newShow", newData: { show }, location: { page: "show" } })
  })
  activePopup.set(null)
}

const OSgroups: any = { V: "verse", C: "chorus", B: "bridge", T: "tag", O: "outro" }
function createSlides({ lyrics }: Song) {
  let slides: any = {}
  let layout: any[] = []
  lyrics.forEach((slide) => {
    let lines = slide.split("\n")
    let group = lines.splice(0, 1)[0]
    let chords = lines.filter((_v: string, i: number) => !(i % 2))
    let text = lines.filter((_v: string, i: number) => i % 2)
    if (text) {
      let id: string = uid()
      layout.push({ id })
      let items = [
        {
          style: "left:50px;top:120px;width:1820px;height:840px;",
          lines: text.map((a: any) => ({ align: "", text: [{ style: "", value: a }] })),
        },
      ]
      // TODO: chords
      console.log(chords)
      slides[id] = {
        group: "",
        color: null,
        settings: {},
        notes: "",
        items,
      }
      let globalGroup = OSgroups[group.replace(/[\[\]0-9]/g, "")]
      if (get(groups)[globalGroup]) slides[id].globalGroup = globalGroup
    }
  })

  return { slides, layout }
}

function XMLtoObject(xml: string) {
  let parser = new DOMParser()
  let song = parser.parseFromString(xml, "text/xml").children[0]

  let object: Song = {
    title: song.getElementsByTagName("title")[0].textContent!,
    author: song.getElementsByTagName("author")[0].textContent!,
    copyright: song.getElementsByTagName("copyright")[0].textContent!,
    // presentation: song.getElementsByTagName("presentation")[0].textContent!,
    // capo: song.getElementsByTagName("capo")[0].textContent!,
    // tempo: song.getElementsByTagName("tempo")[0].textContent!,
    ccli: song.getElementsByTagName("ccli")[0].textContent!,
    // theme: song.getElementsByTagName("theme")[0].textContent!,
    // user1: song.getElementsByTagName("user1")[0].textContent!,
    // user2: song.getElementsByTagName("user2")[0].textContent!,
    // user3: song.getElementsByTagName("user3")[0].textContent!,
    lyrics: song.getElementsByTagName("lyrics")[0].textContent!.split("\n\n"),
    hymn_number: song.getElementsByTagName("hymn_number")[0].textContent!,
    key: song.getElementsByTagName("key")[0].textContent!,
    // aka: song.getElementsByTagName("aka")[0].textContent!,
    // key_line: song.getElementsByTagName("key_line")[0].textContent!,
    // linked_songs: song.getElementsByTagName("linked_songs")[0].textContent!,
    time_sig: song.getElementsByTagName("time_sig")[0].textContent!,
    backgrounds: song.getElementsByTagName("backgrounds")[0].textContent!,
  }

  return object
}
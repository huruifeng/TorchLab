"use client"

import NetworkEditor from "@/components/NetworkEditor"
import {useParams} from "react-router-dom";

export default function EditorPage() {
  // get the id from the url
  const { wsid } = useParams();  // 获取 URL 中的 :wsid
  return <NetworkEditor wsid={wsid}/>
}

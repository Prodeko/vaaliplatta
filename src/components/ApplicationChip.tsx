"use client"

import { Selectable } from "kysely";
import { Application } from "@/lib/db";


function ApplicationChip({ application, url }: { application: Partial<Selectable<Application>>, url: string }) {
    const BLOB_URL = "TODO"

    return (
        <a className="2xl:min-w-sm md:min-w-xs w-full flex justify-between items-center
        hover:bg-muted"
            href={url}
        >
            <h1 className='m-4 font-semibold overflow-auto'>{application?.applicant_name}</h1>
            <img
                src={application.profile_picture ?? BLOB_URL + "/PRODEKO.png"}
                className="w-12 h-12 m-2 aspect-square object-cover rounded-full"
            />
        </a >
    )
}

export default ApplicationChip
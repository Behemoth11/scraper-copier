import path from "path";
import sqlite3 from "sqlite3";
import Logger from "./Logger";
import { ensurePath } from "../utils/ensurePath";
import ScraperManager from "./ScraperManager";
import axios, { AxiosResponse } from "axios";
import DomainTracker from "./DomainTracker";

interface WriteLogger {
  (remoteURL: URL, file: FileObject, message: string): void;
}

export type processManagerMetadata = {
  allLink: number;
  httpRequest: number;
  failedWrite: number;
  successfulWrite: number;
};

export default class ProcessManager {
  db: sqlite3.Database;
  destDirectory: string;
  domainTracker: DomainTracker;
  scraperManager: ScraperManager;

  private metadata: processManagerMetadata = {
    allLink: 0,
    httpRequest: 0,
    failedWrite: 0,
    successfulWrite: 0,
  };

  constructor(destDirectory: string) {
    this.db = {} as sqlite3.Database;
    this.destDirectory = destDirectory;
    this.domainTracker = {} as DomainTracker;
    this.scraperManager = {} as ScraperManager;
  }

  async cleanExit() {
    await this.domainTracker.cleanExit();
    await this.scraperManager.cleanExit();
    console.log("\x1b[37m\nProcess Completed");
    console.log(
      `Total http request : ${Logger.color(
        this.metadata.httpRequest,
        "FgBlue"
      )}  \n`
    );

    console.log(
      `Non completed process : ${Logger.color(
        this.metadata.httpRequest -
          this.metadata.successfulWrite -
          this.metadata.failedWrite,
        "FgYellow"
      )}
    `
    );
    console.log(
      `Failed write : ${Logger.color(this.metadata.failedWrite, "FgRed")}`
    );
    console.log(
      `Successful write : ${Logger.color(
        this.metadata.successfulWrite,
        "FgBlue"
      )}`
    );

    console.log("\n");
  }

  /**
   * Initializes basic properties of ProcessManager: [database, scraperManager]
   *
   * @param dbPath path were processManager must initialize its database;
   * @returns process manager object
   */

  async init(config: { dbPath: string; scraperRootUrls: string[] }) {
    await this.initDb(config.dbPath);

    await this.initDomainTracker();
    await this.initScraperManager(config.scraperRootUrls);
    return this;
  }

  /**
   * Get file from given files
   *
   * @param url remote url
   * @param file file Object
   * @returns axios get request response
   */

  async getRemoteFile(remoteURL: URL, file: FileObject) {
    this.metadata.httpRequest += 1;



    const axiosResponse = (await axios
      .get(remoteURL.href, {
        transformResponse: (res) => {
          return res;
        },
        headers: {
          // host: "canva.com",
          connection: "keep-alive",
      
          "user-agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
        }
      })
      .catch((error) => null) as AxiosResponse<string, any> | null );

    if (!axiosResponse) {
      this.logFailedWrite(remoteURL, file, `Not Found`);
    }

    return axiosResponse;
  }

  incrementAllLink(increment: number) {
    this.metadata.allLink += increment;

    console.log(
      Logger.color(`Retrieved : `, "Reset"),
      Logger.color(`${increment} links `, "FgYellow"),
      `; ${this.metadata.allLink - increment} ==>`,
      Logger.color(this.metadata.allLink, "FgBlue")
    );
  }

  /**
   * Logs file process when failed
   *
   * @param fileExtension file extension
   * @param remoteURL remote url of the file
   * @param data Data string to be logged
   */

  logFailedWrite: WriteLogger = (remoteURL, file, errorMessage) => {
    this.metadata.failedWrite++;
    Logger.logFileProcess(
      file.extension,
      remoteURL.href,
      errorMessage,
      this.metadata,
      {
        main: ["FgWhite"],
        info: ["FgRed"],
      }
    );
  };

  /**
   * Logs successful file Process;
   *
   * @param remoteURL remote url of the file
   * @param file file Object declared in index.d.ts
   * @param localDirectory path where saved on local machine
   *
   */

  logSuccessfulWrite: WriteLogger = (remoteURL, file, localDirectory) => {
    this.metadata.successfulWrite++;
    Logger.logFileProcess(
      file.extension,
      remoteURL.href,
      path.join(localDirectory, file.name),
      this.metadata,
      {
        main: ["FgWhite"],
        info: ["FgGreen"],
      }
    );

    this.domainTracker.lookAtFile(remoteURL, localDirectory);
  };

  /**
   * Initializes new sqlite database
   *
   * @param dbPath path where the database will be created
   * @returns reference to sqlite database
   */
  async initDb(dbPath: string) {
    if (!(await ensurePath(path.dirname(dbPath))))
      console.log(
        Logger.color(`Could not create directory at path ${dbPath}`, "FgRed")
      );

    await new Promise<void>((resolve) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error(err);
        }
        console.log("Successful connection to sqlite database\n");
        resolve();
      });
    });

    return this.db as unknown as sqlite3.Database;
  }

  async initDomainTracker() {
    if (!this.db)
      throw new Error(
        "initDb must be called before scraper initScraperManager"
      );
    this.domainTracker = await new DomainTracker(this.db).init();
    return this.domainTracker;
  }

  async initScraperManager(rootLinks: string[]) {
    if (!this.db)
      throw new Error(
        "initDb must be called before scraper initScraperManager"
      );
    this.scraperManager = await new ScraperManager(this.db).init(rootLinks);
    return this.scraperManager;
  }

  async findNext(limit?: number) {
    const links = await this.scraperManager.findNext(limit);

    if (links.length > 0) this.incrementAllLink(links.length);
    return links;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { TypescriptTemplateRunnerService } from './typescript/TypescriptTemplateRunnerService';
import { TemplateRunnerService } from './TemplateRunnerService';
import { PythonTemplateRunnerService } from './python/PythonTemplateRunnerService';
import { AppLogsService } from '@infra/infrastructure';

@Injectable()
export class TemplateRunnerSvcFactory {
  private services: Map<string, TemplateRunnerService> = new Map<
    string,
    TemplateRunnerService
  >();
  private basePath: string = process.env['RUNNER_TEMPLATE_FOLDER'] || '/tmp';

  constructor(
    private appLogsSvc: AppLogsService,
    private logger: Logger,
  ) {}
  async getRunnerSvc(
    processId: string,
    testId: string,
    runId: string,
    envId: string,
    language: string,
  ): Promise<TemplateRunnerService> {
    if (!this.services.has(envId)) {
      this.logger.log(`Creating new TemplateRunnerService for runId: ${envId}`);
      const envPath = `${this.basePath}/${envId}`;
      if (language === 'typescript') {
        this.services.set(
          envId,
          new TypescriptTemplateRunnerService(
            processId,
            testId,
            runId,
            envPath,
            this.appLogsSvc,
            this.logger,
          ),
        );
      } else {
        this.services.set(
          envId,
          new PythonTemplateRunnerService(
            processId,
            testId,
            runId,
            envPath,
            this.appLogsSvc,
            this.logger,
          ),
        );
      }
    } else {
      this.logger.log(
        `TemplateRunnerService already exists for runId: ${envId}`,
      );
    }
    return this.services.get(envId);
  }

  public removeRunnerSvc(envId: string): void {
    this.logger.log(`Removing TemplateRunnerService for runId: ${envId}`);
    this.services.delete(envId);
  }
}

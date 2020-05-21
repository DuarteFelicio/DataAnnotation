using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using GenericParsing;
using AnalyseFileWorkerService.Models;
using DataAnnotation.Models.Analysis;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace AnalyseFileWorkerService
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;

        public Worker(ILogger<Worker> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory() { HostName = "localhost" };
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: "orders",
                                     durable: false,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);

                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += (model, ea) =>
                {
                    var body = ea.Body;
                    var message = Encoding.UTF8.GetString(body.ToArray());
                    _logger.LogInformation("Recieved {0}", message);
                    ThreadPool.QueueUserWorkItem((state)=> Work(message));
                };
                channel.BasicConsume(queue: "orders",
                                     autoAck: true,
                                     consumer: consumer);

                while (!stoppingToken.IsCancellationRequested)
                {
                    //_logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                    //await Task.Delay(60000, stoppingToken);
                }
            }
            
        }

        private void Work(string message)
        {
            int fileId = int.Parse(message.Split("|")[0]);
            string filePath = message.Split("|")[1];
            Metadata metadata;

            DataAnnotationDBContext _context;
            using (_context = new DataAnnotationDBContext())
            {
                

                CsvFile file = _context.CsvFile.Where(f => f.CsvFilesId == fileId).FirstOrDefault();
                if (file.CsvFilesId == 0)
                {
                    _logger.LogInformation("Message {0} - File not found in database", message);
                    return;
                }


                DateTime timeInit = DateTime.Now;
                DataTable data = new DataTable();
                using (GenericParserAdapter parser = new GenericParserAdapter())
                {
                    parser.SetDataSource(filePath);
                    parser.ColumnDelimiter = ';';
                    parser.FirstRowHasHeader = true;
                    data = parser.GetDataTable();
                }
                file.ColumnsCount = data.Columns.Count;
                file.RowsCount = data.Rows.Count;
                _context.CsvFile.Update(file);
                _context.SaveChanges();

                CsvFileEx fileEx = new CsvFileEx(data, file, _context);
                fileEx.InitIntraAnalysis();
                fileEx.InitDivisoesCompare();
                fileEx.CheckMetricsRelations();
                metadata = new Metadata(file, fileEx, timeInit, _context);
            }

            var json = JsonSerializer.Serialize(metadata);
            filePath += "_analysis";
            System.IO.File.WriteAllText(filePath, json);

            _logger.LogInformation("Message {0} - Work Complete", message);

        }
    }
}

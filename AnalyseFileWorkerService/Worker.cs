using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

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
                    //_logger.LogInformation("Recieved {0}", message);
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
            for(int i =0; i<500000000; ++i)
            {

            }
        }
    }
}

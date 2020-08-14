using IdentityServer4.Events;
using IdentityServer4.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Data
{
    public class LoginEventSink : IEventSink
    {
        public Task PersistAsync(Event evt)
        {
            return Task.CompletedTask;
        }
    }
}

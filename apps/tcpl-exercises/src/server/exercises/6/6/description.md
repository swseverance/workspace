Implement a simple version of the `#define` processor (i.e., no arguments) suitable for use with C programs, based on the routines of this section. You may also find `getch` and `ungetch` helpful.

```c
struct nlist {       /* table entry: */
    struct nlist *next;   /* next entry in chain */
    char *name;           /* defined name */
    char *defn;           /* replacement text */
};

#define HASHSIZE 101
static struct nlist *hashtab[HASHSIZE];  /* pointer table */

/* hash:  form hash value for string s */
unsigned hash(char *s)
{
    unsigned hashval;

    for (hashval = 0; *s != '\0'; s++)
        hashval = *s + 31 * hashval;
    return hashval % HASHSIZE;
}

/* lookup:  look for s in hashtab */
struct nlist *lookup(char *s)
{
    struct nlist *np;

    for (np = hashtab[hash(s)];  np != NULL; np = np->next)
        if (strcmp(s, np->name) == 0)
            return np;     /* found */
    return NULL;           /* not found */
}

/* install:  put (name, defn) in hashtab */
struct nlist *install(char *name, char *defn)
{
    struct nlist *np;
    unsigned hashval;

    if ((np = lookup(name)) == NULL) { /* not found */
        np = (struct nlist *) malloc(sizeof(*np));
        if (np == NULL || (np->name = strdup(name)) == NULL)
            return NULL;
        hashval = hash(name);
        np->next = hashtab[hashval];
        hashtab[hashval] = np;
    } else       /* already there */
        free((void *) np->defn);   /*free previous defn */
    if ((np->defn = strdup(defn)) == NULL)
        return NULL;
    return np;
}
```

Copy the input to the output, with these changes. A line starting with `#define name text` defines `name` and isn't copied; `text` is the rest of the line after the blanks following `name`, and may be empty. A later `#define` of the same name replaces it. From then on, each name (a letter or underscore, then any letters, digits and underscores) that's defined is replaced by its text, which isn't scanned again for names. Names in string and character constants, `/* */` comments and numbers such as `0x1F` aren't replaced. Other lines starting with `#` are copied unchanged.
